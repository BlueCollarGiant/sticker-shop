import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { Product, ProductCategory, ProductCollection, ProductBadge, ProductImage } from '../../../models/product.model';
import { StockManagerComponent } from '../stock-manager/stock-manager';
import { BadgeToggleComponent } from '../badge-toggle/badge-toggle';
import { ProductEditorComponent } from '../product-editor/product-editor';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, StockManagerComponent, BadgeToggleComponent, ProductEditorComponent],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanelComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Tab state
  activeTab = signal<'general' | 'products' | 'sales' | 'users'>('general');

  // State
  products = signal<Product[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  searchQuery = signal('');
  selectedProduct = signal<Product | null>(null);
  showEditor = signal(false);
  showDeleteConfirm = signal(false);
  productToDelete = signal<Product | null>(null);

  // User management state
  userSearchQuery = signal('');
  selectedUser = signal<any | null>(null);

  // Computed stats
  stats = computed(() => {
    const prods = this.products();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return {
      total: prods.length,
      lowStock: prods.filter(p => p.stock < 10).length,
      newProducts: prods.filter(p => new Date(p.createdAt) > thirtyDaysAgo).length,
      bestsellers: prods.filter(p => p.isBestseller).length
    };
  });

  // Filtered products
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.products();

    return this.products().filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  });

  currentUser = this.authService.user;

  ngOnInit(): void {
    // Verify admin access
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAllProducts().subscribe({
      next: (response) => {
        const products = response.data.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        }));
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage.set('Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  onStockUpdated(productId: string, newStock: number): void {
    // Optimistic update
    this.products.update(prods =>
      prods.map(p => p.id === productId ? { ...p, stock: newStock } : p)
    );
  }

  onBadgeToggled(productId: string, badge: string): void {
    // Optimistic update
    this.products.update(prods =>
      prods.map(p => {
        if (p.id !== productId) return p;

        const badges = p.badges || [];
        const badgeEnum = badge as ProductBadge;
        const hasBadge = badges.some(b => b === badgeEnum);
        const newBadges = hasBadge
          ? badges.filter(b => b !== badgeEnum)
          : [...badges, badgeEnum];

        // Update corresponding flag
        const updates: any = { badges: newBadges };
        if (badge === 'new') updates.isNew = !p.isNew;
        if (badge === 'bestseller') updates.isBestseller = !p.isBestseller;
        if (badge === 'limited') updates.isLimitedEdition = !p.isLimitedEdition;

        return { ...p, ...updates };
      })
    );
  }

  handleEditorSave(product: Product): void {
    if (this.selectedProduct()) {
      // Update existing
      this.products.update(prods =>
        prods.map(p => p.id === product.id ? product : p)
      );
    } else {
      // Add new
      this.products.update(prods => [...prods, product]);
    }
    this.showEditor.set(false);
    this.selectedProduct.set(null);
  }

  openEditor(product?: Product): void {
    this.selectedProduct.set(product || null);
    this.showEditor.set(true);
  }

  getImageUrl(image: ProductImage | string): string {
    return typeof image === 'string' ? image : image.url;
  }

  deleteProduct(product: Product): void {
    this.adminService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products.update(prods => prods.filter(p => p.id !== product.id));
        this.showDeleteConfirm.set(false);
        this.productToDelete.set(null);
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
        this.showDeleteConfirm.set(false);
        this.productToDelete.set(null);
      }
    });
  }
}
