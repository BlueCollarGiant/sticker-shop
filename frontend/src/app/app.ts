import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';
import { CartDrawerComponent } from './components/cart/cart-drawer/cart-drawer';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, CartDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sticker-shop');
  cartService = inject(CartService);
  authService = inject(AuthService);

  toggleCart(): void {
    this.cartService.toggleDrawer();
  }
}
