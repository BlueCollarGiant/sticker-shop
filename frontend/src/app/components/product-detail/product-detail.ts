import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../services/products';
import { CartStore } from '../../features/cart/cart.store';
import { Product, ProductVariant, ProductImage } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private cartStore = inject(CartStore);

  // State
  product = signal<Product | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  selectedImageIndex = signal(0);
  selectedVariant = signal<ProductVariant | null>(null);
  relatedProducts = signal<Product[]>([]);

  // Computed
  selectedImage = computed(() => {
    const p = this.product();
    if (!p || !p.images || p.images.length === 0) return null;
    return p.images[this.selectedImageIndex()];
  });

  productImages = computed(() => {
    const p = this.product();
    if (!p || !p.images) return [];
    return p.images as (ProductImage | string)[];
  });

  currentPrice = computed(() => {
    const p = this.product();
    const variant = this.selectedVariant();

    if (!p) return 0;

    // If variant has a price override, use it
    if (variant?.price) return variant.price;

    // Otherwise use sale price if available, else regular price
    return p.salePrice || p.price;
  });

  stockStatus = computed(() => {
    const p = this.product();
    const variant = this.selectedVariant();

    if (!p) return { status: 'unknown', available: false };

    const stock = variant ? variant.stock : p.stock;

    if (stock === 0) {
      return { status: 'Out of Stock', available: false, class: 'out-of-stock' };
    } else if (stock <= 10) {
      return { status: `Low Stock (${stock} left)`, available: true, class: 'low-stock' };
    } else {
      return { status: 'In Stock', available: true, class: 'in-stock' };
    }
  });

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.errorMessage.set('Product ID not found');
      this.isLoading.set(false);
    }
  }

  loadProduct(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productsService.getProduct(id).subscribe({
      next: (product: any) => {
        // Convert createdAt to Date if needed
        if (typeof product.createdAt === 'string') {
          product.createdAt = new Date(product.createdAt);
        }

        this.product.set(product);

        // Select first variant by default if variants exist
        if (product.variants && product.variants.length > 0) {
          this.selectedVariant.set(product.variants[0]);
        }

        this.isLoading.set(false);

        // Load related products
        this.loadRelatedProducts(product.category);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage.set('Product not found');
        this.isLoading.set(false);
      }
    });
  }

  loadRelatedProducts(category: string): void {
    this.productsService.getProducts().subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data;
        const currentId = this.product()?.id;

        // Filter by same category, exclude current product, limit to 4
        const related = products
          .filter((p: Product) => p.category === category && p.id !== currentId)
          .slice(0, 4);

        this.relatedProducts.set(related);
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  selectVariant(variant: ProductVariant): void {
    this.selectedVariant.set(variant);
  }

  isVariantSelected(variant: ProductVariant): boolean {
    return this.selectedVariant()?.id === variant.id;
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    const variant = this.selectedVariant();

    // Check stock availability
    const stock = variant ? variant.stock : p.stock;
    if (stock === 0) return;

    // Get primary image URL
    const imageUrl = typeof p.images[0] === 'string'
      ? p.images[0]
      : p.images[0]?.url || '';

    // Add to cart with new API
    this.cartStore.addItem({
      productId: p.id,
      variantId: variant?.id,
      quantity: 1,
      price: this.currentPrice(),
      title: p.title,
      imageUrl: imageUrl
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  formatCollection(collection: string): string {
    return collection.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getBadgeClass(badge: string): string {
    return `badge-${badge}`;
  }

  getImageUrl(image: ProductImage | string): string {
    return typeof image === 'string' ? image : image.url;
  }

  getImageAlt(image: ProductImage | string, fallback: string): string {
    return typeof image === 'string' ? fallback : image.alt;
  }
}
