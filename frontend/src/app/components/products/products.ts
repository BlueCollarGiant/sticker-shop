import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, ProductCategory, ProductCollection, SortOption, FilterState, ProductBadge, ProductImage } from '../../models/product.model';
import { CartStore } from '../../features/cart/cart.store';
import { ProductStore } from '../../features/products/product.store';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  cartStore = inject(CartStore);
  productStore = inject(ProductStore);

  allProducts = signal<Product[]>([]);

  // Expose store signals for template
  isLoading = this.productStore.isLoading;
  errorMessage = this.productStore.errorMessage;

  filters = signal<FilterState>({
    categories: [],
    collections: [],
    priceRange: { min: 0, max: 100 },
    sortBy: SortOption.NEWEST
  });

  // Enums for template
  ProductCategory = ProductCategory;
  ProductCollection = ProductCollection;
  SortOption = SortOption;
  ProductBadge = ProductBadge;

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load products from API
   */
  async loadProducts(): Promise<void> {
    await this.productStore.loadAllProducts();

    // Update local allProducts from store
    const storeProducts = this.productStore.allProducts();

    // Convert createdAt strings to Date objects for sorting
    const productsWithDates = storeProducts.map((p: any) => ({
      ...p,
      createdAt: p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)
    }));

    this.allProducts.set(productsWithDates);
  }

  // Computed filtered and sorted products
  products = computed(() => {
    let filtered = this.allProducts();
    const currentFilters = this.filters();

    // Filter by categories
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(p => currentFilters.categories.includes(p.category as ProductCategory));
    }

    // Filter by collections
    if (currentFilters.collections.length > 0) {
      filtered = filtered.filter(p => currentFilters.collections.includes(p.collection as ProductCollection));
    }

    // Filter by price
    filtered = filtered.filter(p =>
      p.price >= currentFilters.priceRange.min &&
      p.price <= currentFilters.priceRange.max
    );

    // Sort
    switch (currentFilters.sortBy) {
      case SortOption.NEWEST:
        filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case SortOption.POPULAR:
        filtered = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case SortOption.PRICE_LOW_HIGH:
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case SortOption.PRICE_HIGH_LOW:
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case SortOption.NAME_A_Z:
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  });

  toggleCategoryFilter(category: ProductCategory) {
    this.filters.update(f => {
      const categories = f.categories.includes(category)
        ? f.categories.filter(c => c !== category)
        : [...f.categories, category];
      return { ...f, categories };
    });
  }

  toggleCollectionFilter(collection: ProductCollection) {
    this.filters.update(f => {
      const collections = f.collections.includes(collection)
        ? f.collections.filter(c => c !== collection)
        : [...f.collections, collection];
      return { ...f, collections };
    });
  }

  updateSort(sortBy: SortOption) {
    this.filters.update(f => ({ ...f, sortBy }));
  }

  clearFilters() {
    this.filters.set({
      categories: [],
      collections: [],
      priceRange: { min: 0, max: 100 },
      sortBy: SortOption.NEWEST
    });
  }

  isCategorySelected(category: ProductCategory): boolean {
    return this.filters().categories.includes(category);
  }

  isCollectionSelected(collection: ProductCollection): boolean {
    return this.filters().collections.includes(collection);
  }

  getImageUrl(image: ProductImage | string): string {
    return typeof image === 'string' ? image : image.url;
  }

  getImageAlt(image: ProductImage | string, title: string): string {
    return typeof image === 'string' ? title : image.alt;
  }

  getBadgeClass(badge: ProductBadge): string {
    return `badge-${badge}`;
  }

  formatCollection(collection: ProductCollection | string): string {
    const collectionStr = typeof collection === 'string' ? collection : collection;
    return collectionStr.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  addToCart(product: Product): void {
    const firstImage = product.images[0];
    const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;

    this.cartStore.addItem({
      productId: product.id,
      quantity: 1,
      price: product.salePrice || product.price,
      title: product.title,
      imageUrl: imageUrl,
    });
  }
}
