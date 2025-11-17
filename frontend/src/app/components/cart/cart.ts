import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItemComponent } from '../cart-item/cart-item';
import { CartSummaryComponent } from '../cart-summary/cart-summary';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, CartItemComponent, CartSummaryComponent],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  cartService = inject(CartService);
  router = inject(Router);

  onQuantityChange(event: { itemId: string; newQuantity: number }): void {
    this.cartService.updateQuantity(event.itemId, event.newQuantity);
  }

  onRemoveItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }
}
