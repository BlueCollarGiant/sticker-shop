import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartStore } from '../../features/cart/cart.store';
import { CartItemComponent } from '../cart-item/cart-item';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, CartItemComponent],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  cartStore = inject(CartStore);
  router = inject(Router);

  onQuantityChange(event: { itemId: string; newQuantity: number }): void {
    this.cartStore.updateQuantity(event.itemId, event.newQuantity);
  }

  onRemoveItem(itemId: string): void {
    this.cartStore.removeItem(itemId);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartStore.clearCart();
    }
  }
}
