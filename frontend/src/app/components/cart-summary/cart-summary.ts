import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartTotals } from '../../features/cart/cart.types';

@Component({
  selector: 'app-cart-summary',
  imports: [CommonModule],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.css',
})
export class CartSummaryComponent {
  @Input({ required: true }) cartTotals!: CartTotals;
  @Input() mode: 'compact' | 'detailed' = 'detailed';
  @Input() showCheckoutButton: boolean = true;
  @Input() showContinueButton: boolean = true;

  @Output() checkout = new EventEmitter<void>();
  @Output() continueShopping = new EventEmitter<void>();

  onCheckout(): void {
    this.checkout.emit();
  }

  onContinueShopping(): void {
    this.continueShopping.emit();
  }

  get freeShippingRemaining(): number | null {
    const threshold = 50;
    if (this.cartTotals.subtotal < threshold) {
      return threshold - this.cartTotals.subtotal;
    }
    return null;
  }
}
