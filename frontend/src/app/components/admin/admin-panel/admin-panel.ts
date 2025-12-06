import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthStore } from '../../../features/auth/auth.store';
import { Product, ProductCategory, ProductCollection, ProductBadge, ProductImage } from '../../../models/product.model';
import { StockManagerComponent } from '../stock-manager/stock-manager';
import { BadgeToggleComponent } from '../badge-toggle/badge-toggle';
import { ProductEditorComponent } from '../product-editor/product-editor';
import { AdminOrdersComponent } from '../admin-orders/admin-orders';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, StockManagerComponent, BadgeToggleComponent, ProductEditorComponent, AdminOrdersComponent],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanelComponent implements OnInit {
  private adminService = inject(AdminService);
  private auth = inject(AuthStore);
  private router = inject(Router);

  // Tab state
  activeTab = signal<'general' | 'products' | 'orders' | 'sales' | 'users'>('general');

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
  users = signal<any[]>([]);
  userSearchQuery = signal('');
  selectedUserId = signal<string | null>(null);
  userOrders = signal<any[]>([]);
  loadingUsers = signal(false);

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

  // Filtered users
  filteredUsers = computed(() => {
    const query = this.userSearchQuery().toLowerCase();
    if (!query) return this.users();

    return this.users().filter(u =>
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  });

  currentUser = this.auth.user;

  ngOnInit(): void {
    // Verify admin access
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadProducts();
    this.loadUsers();
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
        if (badge === 'sale') {
          const saleOn = !hasBadge;
          updates.isSale = saleOn;
          updates.salePrice = saleOn
            ? Math.round((p.price * 0.9) * 100) / 100
            : undefined;
        }

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

  // ===== USER MANAGEMENT METHODS =====

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        this.users.set(response.data || []);
        this.loadingUsers.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users.set([]);
        this.loadingUsers.set(false);
      }
    });
  }

  toggleUserDetails(userId: string): void {
    // If clicking the same user, collapse
    if (this.selectedUserId() === userId) {
      this.selectedUserId.set(null);
      this.userOrders.set([]);
      return;
    }

    // Expand new user
    this.selectedUserId.set(userId);

    // Load user's orders
    this.loadUserOrders(userId);
  }

  loadUserOrders(userId: string): void {
    this.userOrders.set([]);
    this.adminService.getUserOrders(userId).subscribe({
      next: (response) => {
        const orders = (response.data || []).map((order: any) => ({
          ...order,
          date: new Date(order.createdAt || order.date)
        }));
        this.userOrders.set(orders);
      },
      error: (error) => {
        console.error('Error loading user orders:', error);
        this.userOrders.set([]);
      }
    });
  }

  isUserExpanded(userId: string): boolean {
    return this.selectedUserId() === userId;
  }

  getUserInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
