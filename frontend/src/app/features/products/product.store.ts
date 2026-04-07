import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductApi, ProductQueryParams } from './product.api';
import { Product, ProductCatalog, ProductListMeta } from './product.types';

@Injectable({
  providedIn: 'root',
})
export class ProductStore {
  private productApi = inject(ProductApi);

  // Core state
  private products = signal<Product[]>([]);
  private catalog = signal<ProductCatalog | null>(null);
  private selectedProduct = signal<Product | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Pagination state
  private meta = signal<ProductListMeta>({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Public readonly signals
  readonly allProducts = this.products.asReadonly();
  readonly catalogData = this.catalog.asReadonly();
  readonly currentProduct = this.selectedProduct.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly errorMessage = this.error.asReadonly();
  readonly paginationMeta = this.meta.asReadonly();

  // Derived pagination signals
  readonly currentPage = computed(() => this.meta().page);
  readonly totalPages = computed(() => this.meta().totalPages);
  readonly totalProducts = computed(() => this.meta().total);
  readonly hasProducts = computed(() => this.products().length > 0);
  readonly productCount = computed(() => this.products().length);

  // Computed views — reflect the current page only.
  // NOTE: After pagination these only cover loaded products, not the full catalog.
  // Use loadAllProducts({ limit: 100 }) if a full scan is needed (admin panel).
  readonly bestsellers = computed(() => this.products().filter(p => p.isBestseller));
  readonly newProducts = computed(() => this.products().filter(p => p.isNew));

  getProductsByCategory(category: string) {
    return computed(() => this.products().filter(p => p.category === category));
  }

  getProductsByCollection(collection: string) {
    return computed(() => this.products().filter(p => p.collection === collection));
  }

  async loadAllProducts(params?: ProductQueryParams): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await firstValueFrom(this.productApi.getAllProducts(params));
      this.products.set(result.data);
      this.meta.set(result.meta);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load products');
      console.error('Failed to load products:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadPage(page: number, query?: string): Promise<void> {
    return this.loadAllProducts({ page, limit: this.meta().limit, q: query });
  }

  async loadProductById(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const product = await firstValueFrom(this.productApi.getProductById(id));
      if (product) {
        this.selectedProduct.set(product);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load product');
      console.error('Failed to load product:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadCatalog(): Promise<void> {
    try {
      const catalog = await firstValueFrom(this.productApi.getCatalog());
      if (catalog) {
        this.catalog.set(catalog);
      }
    } catch (err: any) {
      console.error('Failed to load catalog:', err);
    }
  }

  clearSelectedProduct(): void {
    this.selectedProduct.set(null);
  }

  clearError(): void {
    this.error.set(null);
  }
}
