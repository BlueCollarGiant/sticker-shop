import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-badge-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-toggle.html',
  styleUrl: './badge-toggle.css'
})
export class BadgeToggleComponent {
  @Input({ required: true }) product!: Product;
  @Output() badgeToggled = new EventEmitter<string>();

  private adminService = inject(AdminService);

  hasBadge(badge: string): boolean {
    return this.product.badges?.includes(badge) || false;
  }

  toggle(badge: string): void {
    this.adminService.toggleBadge(this.product.id, badge).subscribe({
      next: () => {
        this.badgeToggled.emit(badge);
      },
      error: (error) => {
        console.error('Error toggling badge:', error);
        // Revert will happen in parent component
      }
    });
  }
}
