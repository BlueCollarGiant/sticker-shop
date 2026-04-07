import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Product, ProductCategory, ProductCollection, SortOption, FilterState, ProductBadge, ProductImage } from '../../models/product.model';
import { CartStore } from '../../features/cart/cart.store';
import { ProductStore } from '../../features/products/product.store';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  cartStore = inject(CartStore);
  productStore = inject(ProductStore);

  isLoading = this.productStore.isLoading;
  errorMessage = this.productStore.errorMessage;
  currentPage = this.productStore.currentPage;
  totalPages = this.productStore.totalPages;
  totalProducts = this.productStore.totalProducts;

  searchQuery = signal('');
  private searchSubject = new Subject<string>();

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
    // Debounce search input — fires backend request after 300ms idle
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.productStore.loadAllProducts({ q: query, page: 1, limit: 12 });
    });

    this.productStore.loadAllProducts({ page: 1, limit: 12 });
  }

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.productStore.loadPage(page, this.searchQuery() || undefined);
  }

  // Client-side filter and sort over the current page results.
  // Category, collection, price, and sort are applied to the loaded page.
  // NOTE: these do not trigger a new backend request — they narrow the current page.
  products = computed(() => {
    let filtered = this.productStore.allProducts() as Product[];
    const currentFilters = this.filters();

    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(p => currentFilters.categories.includes(p.category as ProductCategory));
    }

    if (currentFilters.collections.length > 0) {
      filtered = filtered.filter(p => currentFilters.collections.includes(p.collection as ProductCollection));
    }

    filtered = filtered.filter(p =>
      p.price >= currentFilters.priceRange.min &&
      p.price <= currentFilters.priceRange.max
    );

    switch (currentFilters.sortBy) {
      case SortOption.NEWEST:
        filtered = [...filtered].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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
    this.searchQuery.set('');
    this.searchSubject.next('');
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
    return (collection as string).split('-').map(word =>
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
      imageUrl,
    });
  }
}
