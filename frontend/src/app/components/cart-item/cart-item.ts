import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../features/cart/cart.types';

@Component({
  selector: 'app-cart-item',
  imports: [CommonModule],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.css',
})
export class CartItemComponent {
  @Input({ required: true }) item!: CartItem;
  @Input() mode: 'compact' | 'detailed' = 'detailed';

  @Output() quantityChange = new EventEmitter<{ itemId: string; newQuantity: number }>();
  @Output() remove = new EventEmitter<string>();

  showRemoveConfirm = false;

  incrementQuantity(): void {
    const newQuantity = this.item.quantity + 1;
    this.quantityChange.emit({ itemId: this.item.id, newQuantity });
  }

  decrementQuantity(): void {
    if (this.item.quantity > 1) {
      const newQuantity = this.item.quantity - 1;
      this.quantityChange.emit({ itemId: this.item.id, newQuantity });
    }
  }

  updateQuantity(value: string): void {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      this.quantityChange.emit({ itemId: this.item.id, newQuantity });
    }
  }

  removeItem(): void {
    if (this.mode === 'detailed' && !this.showRemoveConfirm) {
      this.showRemoveConfirm = true;
      setTimeout(() => {
        this.showRemoveConfirm = false;
      }, 3000);
    } else {
      this.remove.emit(this.item.id);
      this.showRemoveConfirm = false;
    }
  }

  getItemTotal(): number {
    return this.item.price * this.item.quantity;
  }
}
