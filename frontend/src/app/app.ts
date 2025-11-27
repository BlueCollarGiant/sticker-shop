import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CartStore } from './features/cart/cart.store';
import { AuthStore } from './features/auth/auth.store';
import { CartDrawerComponent } from './components/cart/cart-drawer/cart-drawer';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, CartDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sticker-shop');
  cartStore = inject(CartStore);
  auth = inject(AuthStore);

  toggleCart(): void {
    this.cartStore.toggleDrawer();
  }
}
