/**
 * Product Store
 * Signals-based state management for products
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { ProductApi } from './product.api';
import { Product, ProductCatalog } from './product.types';

@Injectable({
  providedIn: 'root',
})
export class ProductStore {
  private productApi = inject(ProductApi);

  // State signals
  private products = signal<Product[]>([]);
  private catalog = signal<ProductCatalog | null>(null);
  private selectedProduct = signal<Product | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals
  readonly allProducts = this.products.asReadonly();
  readonly catalogData = this.catalog.asReadonly();
  readonly currentProduct = this.selectedProduct.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly errorMessage = this.error.asReadonly();

  // Computed signals
  readonly productCount = computed(() => this.products().length);
  readonly hasProducts = computed(() => this.products().length > 0);

  // Filtered products by category
  getProductsByCategory(category: string) {
    return computed(() =>
      this.products().filter((p) => p.category === category)
    );
  }

  // Filtered products by collection
  getProductsByCollection(collection: string) {
    return computed(() =>
      this.products().filter((p) => p.collection === collection)
    );
  }

  // Get bestsellers
  readonly bestsellers = computed(() =>
    this.products().filter((p) => p.isBestseller)
  );

  // Get new products
  readonly newProducts = computed(() =>
    this.products().filter((p) => p.isNew)
  );

  // Load all products
  async loadAllProducts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.productApi.getAllProducts().toPromise();
      if (result) {
        this.products.set(result.data);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load products');
      console.error('Failed to load products:', err);
    } finally {
      this.loading.set(false);
    }
  }

  // Load product by ID
  async loadProductById(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const product = await this.productApi.getProductById(id).toPromise();
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

  // Load catalog metadata
  async loadCatalog(): Promise<void> {
    try {
      const catalog = await this.productApi.getCatalog().toPromise();
      if (catalog) {
        this.catalog.set(catalog);
      }
    } catch (err: any) {
      console.error('Failed to load catalog:', err);
    }
  }

  // Clear selected product
  clearSelectedProduct(): void {
    this.selectedProduct.set(null);
  }

  // Clear error
  clearError(): void {
    this.error.set(null);
  }
}
