import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { CartItemComponent } from '../../cart-item/cart-item';
import { CartSummaryComponent } from '../../cart-summary/cart-summary';

@Component({
  selector: 'app-cart-drawer',
  imports: [CommonModule, CartItemComponent, CartSummaryComponent],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css',
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  router = inject(Router);

  closeDrawer(): void {
    this.cartService.closeDrawer();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDrawer();
    }
  }

  onQuantityChange(event: { itemId: string; newQuantity: number }): void {
    this.cartService.updateQuantity(event.itemId, event.newQuantity);
  }

  onRemoveItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
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
