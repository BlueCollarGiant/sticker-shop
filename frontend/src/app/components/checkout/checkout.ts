import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);

  processing = signal(false);

  completeOrder() {
    this.processing.set(true);

    // Get cart items
    const cartItems = this.cartService.cartItems();
    const totals = this.cartService.cartTotals();

    // Generate order
    const order = {
      id: `order_${Date.now()}`,
      orderNumber: this.generateOrderNumber(),
      date: new Date(),
      status: 'processing' as const,
      total: totals.total,
      items: cartItems.map(item => ({
        id: item.productId,
        name: item.productTitle,
        price: item.price,
        quantity: item.quantity,
        image: item.productImage
      }))
    };

    // Save order to localStorage
    const savedOrders = localStorage.getItem('user_orders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    orders.unshift(order); // Add new order to beginning
    localStorage.setItem('user_orders', JSON.stringify(orders));

    // Clear cart
    this.cartService.clearCart();

    // Simulate processing delay
    setTimeout(() => {
      this.processing.set(false);
      // Redirect to orders page
      this.router.navigate(['/dashboard/orders']);
    }, 1500);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
  }

  get cartItems() {
    return this.cartService.cartItems();
  }

  get cartTotals() {
    return this.cartService.cartTotals();
  }
}
