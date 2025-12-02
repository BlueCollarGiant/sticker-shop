import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartStore } from '../../features/cart/cart.store';
import { AuthStore } from '../../features/auth/auth.store';
import { OrderStore } from '../../features/orders/order.store';
import { CreateOrderInput, ShippingAddress } from '../../features/orders/order.types';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  cartStore = inject(CartStore);
  auth = inject(AuthStore);
  orderStore = inject(OrderStore);
  router = inject(Router);

  processing = signal(false);
  errorMessage = signal<string | null>(null);

  // Shipping form state
  shippingForm = signal<ShippingAddress>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: ''
  });

  async completeOrder() {
    this.processing.set(true);
    this.errorMessage.set(null);

    const currentUser = this.auth.user();
    if (!currentUser) {
      console.error('No user logged in');
      this.processing.set(false);
      this.router.navigate(['/login']);
      return;
    }

    // Validate shipping form
    const shipping = this.shippingForm();
    if (!shipping.fullName || !shipping.address1 || !shipping.city || !shipping.state || !shipping.zipCode) {
      this.errorMessage.set('Please fill in all required shipping fields');
      this.processing.set(false);
      return;
    }

    // Get cart items
    const cartItems = this.cartStore.items();
    const totals = this.cartStore.totals();

    if (cartItems.length === 0) {
      this.errorMessage.set('Your cart is empty');
      this.processing.set(false);
      return;
    }

    // Create order input
    const orderInput: CreateOrderInput = {
      items: cartItems.map(item => ({
        productId: item.productId,
        productTitle: item.title,
        productImage: item.imageUrl,
        variantId: item.variantId,
        variantDetails: item.variantId ? `Variant ${item.variantId}` : undefined,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.total,
      shippingAddress: shipping,
      // In demo mode, no payment intent (will be PENDING status)
      // In production, would create payment intent first
      paymentIntentId: undefined
    };

    try {
      // Create order via OrderStore
      await this.orderStore.createOrder(orderInput);

      // Clear cart
      this.cartStore.clearCart();

      // Simulate processing delay
      setTimeout(() => {
        this.processing.set(false);
        // Redirect to orders page
        this.router.navigate(['/dashboard/orders']);
      }, 1500);
    } catch (error: any) {
      console.error('Error creating order:', error);
      this.errorMessage.set(error.message || 'Failed to create order');
      this.processing.set(false);
    }
  }

  updateShippingField(field: keyof ShippingAddress, value: string) {
    this.shippingForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  get cartItems() {
    return this.cartStore.items();
  }

  get cartTotals() {
    return this.cartStore.totals();
  }
}
