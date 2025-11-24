import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-stock-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-manager.html',
  styleUrl: './stock-manager.css'
})
export class StockManagerComponent {
  @Input({ required: true }) product!: Product;
  @Output() stockUpdated = new EventEmitter<number>();

  private adminService = inject(AdminService);

  isEditing = signal(false);
  stockValue = signal(0);
  isSaving = signal(false);
  successFlash = signal(false);
  errorMessage = signal<string | null>(null);

  startEdit(): void {
    this.stockValue.set(this.product.stock);
    this.isEditing.set(true);
    this.errorMessage.set(null);
  }

  cancel(): void {
    this.isEditing.set(false);
    this.errorMessage.set(null);
  }

  save(): void {
    const newStock = this.stockValue();

    if (newStock < 0) {
      this.errorMessage.set('Stock cannot be negative');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.adminService.updateStock(this.product.id, newStock).subscribe({
      next: () => {
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.successFlash.set(true);
        this.stockUpdated.emit(newStock);

        // Clear success flash after animation
        setTimeout(() => this.successFlash.set(false), 1000);
      },
      error: (error) => {
        console.error('Error updating stock:', error);
        this.errorMessage.set('Failed to update');
        this.isSaving.set(false);
      }
    });
  }
}
