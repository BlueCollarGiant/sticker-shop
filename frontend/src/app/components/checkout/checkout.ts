import { Component, signal, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartStore } from '../../features/cart/cart.store';
import { AuthStore } from '../../features/auth/auth.store';
import { OrderStore } from '../../features/orders/order.store';
import { CheckoutApi } from '../../features/checkout/checkout.api';
import { CreateOrderInput, OrderStatus, ShippingAddress } from '../../features/orders/order.types';

declare const Stripe: any;

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, AfterViewInit, OnDestroy {
  private cartStore = inject(CartStore);
  private auth = inject(AuthStore);
  private orderStore = inject(OrderStore);
  private checkoutApi = inject(CheckoutApi);
  private router = inject(Router);

  readonly processing = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly stripeReady = signal(false);

  readonly shippingForm = signal<ShippingAddress>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
  });

  private stripe: any = null;
  private cardElement: any = null;

  // Both must be true before mount runs — whichever arrives second calls tryMountStripe()
  private _publishableKey: string | null = null;
  private _viewReady = false;

  get cartItems() { return this.cartStore.items(); }
  get cartTotals() { return this.cartStore.totals(); }

  ngOnInit() {
    this.checkoutApi.getConfig().subscribe({
      next: (res) => {
        if (res.success && res.data?.publishableKey) {
          this._publishableKey = res.data.publishableKey;
          this.tryMountStripe();
        } else {
          this.errorMessage.set('Payment system unavailable. Please try again later.');
        }
      },
      error: () => {
        this.errorMessage.set('Could not load payment system. Please refresh and try again.');
      },
    });
  }

  ngAfterViewInit() {
    this._viewReady = true;
    this.tryMountStripe();
  }

  ngOnDestroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  private tryMountStripe() {
    // Only proceeds when both the publishable key has loaded AND the view is ready.
    // Called from both ngAfterViewInit and the config HTTP callback — whichever fires
    // second will find both flags true and trigger the mount exactly once.
    if (!this._publishableKey || !this._viewReady || this.stripe) {
      return;
    }

    if (typeof Stripe === 'undefined') {
      this.errorMessage.set('Payment system failed to load. Please refresh the page and try again.');
      return;
    }

    this.stripe = Stripe(this._publishableKey);
    const elements = this.stripe.elements();

    this.cardElement = elements.create('card', {
      style: {
        base: {
          color: '#e8dcc8',
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          '::placeholder': { color: '#6b7280' },
        },
        invalid: { color: '#ef4444' },
      },
    });

    this.cardElement.mount('#card-element');
    this.stripeReady.set(true);

    this.cardElement.on('change', (event: any) => {
      this.errorMessage.set(event.error ? event.error.message : null);
    });
  }

  async completeOrder() {
    this.processing.set(true);
    this.errorMessage.set(null);

    if (!this.auth.user()) {
      this.processing.set(false);
      this.router.navigate(['/login']);
      return;
    }

    const shipping = this.shippingForm();
    if (!shipping.fullName || !shipping.address1 || !shipping.city || !shipping.state || !shipping.zipCode) {
      this.errorMessage.set('Please fill in all required shipping fields');
      this.processing.set(false);
      return;
    }

    const cartItems = this.cartStore.items();
    const totals = this.cartStore.totals();

    if (cartItems.length === 0) {
      this.errorMessage.set('Your cart is empty');
      this.processing.set(false);
      return;
    }

    if (!this.stripe || !this.cardElement) {
      this.errorMessage.set('Payment system is not ready. Please wait a moment and try again.');
      this.processing.set(false);
      return;
    }

    try {
      // Step 1: Create payment intent — backend uses secret key, returns clientSecret only
      const intentRes = await firstValueFrom(
        this.checkoutApi.createPaymentIntent({ amount: totals.total, currency: 'usd' })
      );

      if (!intentRes.success || !intentRes.data?.clientSecret) {
        this.errorMessage.set(intentRes.message || 'Could not initiate payment. Please try again.');
        this.processing.set(false);
        return;
      }

      const { clientSecret, paymentIntentId } = intentRes.data;

      // Step 2: Confirm payment — card details go directly to Stripe, never our server
      const { error: stripeError, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: this.cardElement } }
      );

      if (stripeError) {
        this.errorMessage.set(stripeError.message || 'Payment failed. Please check your card details.');
        this.processing.set(false);
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        this.errorMessage.set('Payment was not completed. Please try again.');
        this.processing.set(false);
        return;
      }

      // Step 3: Payment confirmed — create order with paid status and Stripe reference
      const orderInput: CreateOrderInput = {
        items: cartItems.map(item => ({
          productId: item.productId,
          productTitle: item.title,
          productImage: item.imageUrl,
          variantId: item.variantId,
          variantDetails: item.variantId ? `Variant ${item.variantId}` : undefined,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        status: OrderStatus.PAID,
        paymentIntentId,
        shippingAddress: shipping,
      };

      await this.orderStore.createOrder(orderInput);

      // Step 4: Clear cart and navigate to orders
      await this.cartStore.clearCart();
      this.processing.set(false);
      this.router.navigate(['/dashboard/orders']);

    } catch (error: any) {
      console.error('Checkout error:', error);
      this.errorMessage.set(error.message || 'Something went wrong. Please try again.');
      this.processing.set(false);
    }
  }

  updateShippingField(field: keyof ShippingAddress, value: string) {
    this.shippingForm.update(form => ({ ...form, [field]: value }));
  }
}
