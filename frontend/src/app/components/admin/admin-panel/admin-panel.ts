import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthStore } from '../../../features/auth/auth.store';
import { Product, ProductCategory, ProductCollection, ProductBadge, ProductImage } from '../../../models/product.model';
import { User } from '../../../models/user.model';
import { StockManagerComponent } from '../stock-manager/stock-manager';
import { BadgeToggleComponent } from '../badge-toggle/badge-toggle';
import { ProductEditorComponent } from '../product-editor/product-editor';
import { AdminOrdersComponent } from '../admin-orders/admin-orders';
import { createSearchEngine, handleSearchKeyboard, SearchEngine } from '../../../core/search';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, StockManagerComponent, BadgeToggleComponent, ProductEditorComponent, AdminOrdersComponent],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private auth = inject(AuthStore);
  private router = inject(Router);

  // Tab state
  activeTab = signal<'general' | 'products' | 'orders' | 'sales' | 'users'>('general');

  // State
  products = signal<Product[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  selectedProduct = signal<Product | null>(null);
  showEditor = signal(false);
  showDeleteConfirm = signal(false);
  productToDelete = signal<Product | null>(null);

  // User management state
  users = signal<User[]>([]);
  selectedUserId = signal<string | null>(null);
  userOrders = signal<any[]>([]);
  loadingUsers = signal(false);

  // Search engines (initialized in constructor for injection context)
  productSearch: SearchEngine<Product>;
  userSearch: SearchEngine<User>;

  // Computed stats
  stats = computed(() => {
    const prods = this.products();

    return {
      total: prods.length,
      lowStock: prods.filter(p => p.stock < 10).length,
      newProducts: prods.filter(p => p.isNew).length,
      bestsellers: prods.filter(p => p.isBestseller).length
    };
  });

  // Filtered products - using search engine
  filteredProducts = computed(() => {
    if (this.productSearch) {
      return this.productSearch.filtered();
    }
    return this.products();
  });

  // Filtered users - using search engine
  filteredUsers = computed(() => {
    if (this.userSearch) {
      return this.userSearch.filtered();
    }
    return this.users();
  });

  currentUser = this.auth.user;

  constructor() {
    // Initialize product search engine in constructor (injection context required)
    this.productSearch = createSearchEngine(this.products, {
      fields: ['title', 'category', 'subtitle', 'description'],
      getLabel: (product) => product.title,
      getKey: (product) => product.id,
      debounceMs: 300,
      maxSuggestions: 5,
      enableSuggestions: true
    });

    // Initialize user search engine in constructor (injection context required)
    this.userSearch = createSearchEngine(this.users, {
      fields: ['name', 'email', 'role'],
      getLabel: (user) => user.name,
      getKey: (user) => user.id,
      debounceMs: 200,
      maxSuggestions: 5,
      enableSuggestions: true
    });
  }

  ngOnInit(): void {
    // Verify admin access
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadProducts();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    // Clean up search engine subscriptions
    if (this.productSearch) {
      this.productSearch.destroy();
    }
    if (this.userSearch) {
      this.userSearch.destroy();
    }
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

  // ===== SEARCH ENGINE METHODS =====

  // Product search
  onProductSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.productSearch.setQuery(input.value);
  }

  onProductSearchKeyDown(event: KeyboardEvent): void {
    if (handleSearchKeyboard(event, this.productSearch)) {
      event.preventDefault();
    }
  }

  onProductSearchFocus(): void {
    this.productSearch.openSuggestions();
  }

  onProductSearchBlur(): void {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      this.productSearch.closeSuggestions();
    }, 200);
  }

  selectProductSuggestion(product: Product): void {
    this.productSearch.selectSuggestion(product);
    // Optionally scroll to product in table or highlight it
  }

  highlightProductText(text: string): string {
    return this.productSearch.highlight(text);
  }

  // User search
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.userSearch.setQuery(input.value);
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    if (handleSearchKeyboard(event, this.userSearch)) {
      event.preventDefault();
    }
  }

  selectUserSuggestion(user: User): void {
    this.userSearch.selectSuggestion(user);
    // Optionally expand the selected user
    this.toggleUserDetails(user.id);
  }

  highlightText(text: string): string {
    return this.userSearch.highlight(text);
  }

  onSearchBlur(): void {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      this.userSearch.closeSuggestions();
    }, 200);
  }

  onSearchFocus(): void {
    this.userSearch.openSuggestions();
  }
}
