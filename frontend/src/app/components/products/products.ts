import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MOCK_PRODUCTS } from '../../services/shop/mock-products';
import { Product, ProductCategory, ProductCollection, SortOption, FilterState, ProductBadge } from '../../models/product.model';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  allProducts = signal<Product[]>(MOCK_PRODUCTS);

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

  // Computed filtered and sorted products
  products = computed(() => {
    let filtered = this.allProducts();
    const currentFilters = this.filters();

    // Filter by categories
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(p => currentFilters.categories.includes(p.category));
    }

    // Filter by collections
    if (currentFilters.collections.length > 0) {
      filtered = filtered.filter(p => currentFilters.collections.includes(p.collection));
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

  getBadgeClass(badge: ProductBadge): string {
    return `badge-${badge}`;
  }

  formatCollection(collection: ProductCollection): string {
    return collection.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}
