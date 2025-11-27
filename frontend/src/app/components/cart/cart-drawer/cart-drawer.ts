import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../features/cart/cart.store';
import { CartItemComponent } from '../../cart-item/cart-item';

@Component({
  selector: 'app-cart-drawer',
  imports: [CommonModule, CartItemComponent],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css',
})
export class CartDrawerComponent {
  cartStore = inject(CartStore);
  router = inject(Router);

  closeDrawer(): void {
    this.cartStore.closeDrawer();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDrawer();
    }
  }

  onQuantityChange(event: { itemId: string; newQuantity: number }): void {
    this.cartStore.updateQuantity(event.itemId, event.newQuantity);
  }

  onRemoveItem(itemId: string): void {
    this.cartStore.removeItem(itemId);
  }

  goToCheckout(): void {
    this.closeDrawer();
    this.router.navigate(['/checkout']);
  }

  goToCart(): void {
    this.closeDrawer();
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.closeDrawer();
  }
}
