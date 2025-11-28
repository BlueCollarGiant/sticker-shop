import { Component, Input, Output, EventEmitter, signal, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Product, ProductCategory, ProductCollection, ProductVariant, ProductImage, ProductBadge } from '../../../models/product.model';

@Component({
  selector: 'app-product-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-editor.html',
  styleUrl: './product-editor.css'
})
export class ProductEditorComponent implements OnInit {
  @Input() product: Product | null = null;
  @Output() save = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  private adminService = inject(AdminService);

  // Form state
  title = signal('');
  subtitle = signal('');
  description = signal('');
  price = signal(0);
  salePrice = signal<number | null>(null);
  category = signal<ProductCategory>(ProductCategory.STICKERS);
  collection = signal<ProductCollection>(ProductCollection.DARK_ACADEMIA);
  tags = signal<string[]>([]);
  tagInput = signal('');
  images = signal<ProductImage[]>([]);
  imageInput = signal('');
  variants = signal<ProductVariant[]>([]);
  stock = signal(0);
  isNew = signal(false);
  isBestseller = signal(false);
  isLimitedEdition = signal(false);

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  // Available options
  categories = Object.values(ProductCategory);
  collections = Object.values(ProductCollection);

  ngOnInit(): void {
    if (this.product) {
      this.loadProduct(this.product);
    }
  }

  loadProduct(product: Product): void {
    this.title.set(product.title);
    this.subtitle.set(product.subtitle || '');
    this.description.set(product.description);
    this.price.set(product.price);
    this.salePrice.set(product.salePrice || null);
    this.category.set(product.category as ProductCategory);
    this.collection.set(product.collection as ProductCollection);
    this.tags.set([...product.tags]);

    // Convert string[] images to ProductImage[]
    const images = product.images.map((img, index) => {
      if (typeof img === 'string') {
        return {
          id: `img-${index}`,
          url: img,
          alt: product.title,
          isPrimary: index === 0,
          order: index
        };
      }
      return img;
    });
    this.images.set(images);

    this.variants.set(product.variants ? [...product.variants] : []);
    this.stock.set(product.stock);
    this.isNew.set(product.isNew || false);
    this.isBestseller.set(product.isBestseller || false);
    this.isLimitedEdition.set(product.isLimitedEdition || false);
  }

  addTag(): void {
    const tag = this.tagInput().trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update(tags => [...tags, tag]);
      this.tagInput.set('');
    }
  }

  removeTag(tag: string): void {
    this.tags.update(tags => tags.filter(t => t !== tag));
  }

  addImage(): void {
    const url = this.imageInput().trim();
    if (url && !this.images().some(img => img.url === url)) {
      const newImage: ProductImage = {
        id: `img-${Date.now()}`,
        url,
        alt: this.title() || 'Product image',
        isPrimary: this.images().length === 0,
        order: this.images().length
      };
      this.images.update(images => [...images, newImage]);
      this.imageInput.set('');
    }
  }

  removeImage(imageUrl: string): void {
    this.images.update(images => images.filter(i => i.url !== imageUrl));
  }

  addVariant(): void {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      size: 'Small',
      color: '',
      stock: 0,
      sku: `SKU-${Date.now()}`
    };
    this.variants.update(variants => [...variants, newVariant]);
  }

  removeVariant(index: number): void {
    this.variants.update(variants => variants.filter((_, i) => i !== index));
  }

  updateVariant(index: number, field: keyof ProductVariant, value: any): void {
    this.variants.update(variants =>
      variants.map((v, i) => i === index ? { ...v, [field]: value } : v)
    );
  }

  onSave(): void {
    // Validation
    if (!this.title().trim()) {
      this.errorMessage.set('Title is required');
      return;
    }
    if (this.price() <= 0) {
      this.errorMessage.set('Price must be greater than 0');
      return;
    }
    if (this.images().length === 0) {
      this.errorMessage.set('At least one image is required');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const badges: ProductBadge[] = [];
    if (this.isNew()) badges.push(ProductBadge.NEW);
    if (this.isBestseller()) badges.push(ProductBadge.BESTSELLER);
    if (this.isLimitedEdition()) badges.push(ProductBadge.LIMITED);
    if (this.salePrice() && this.salePrice()! < this.price()) badges.push(ProductBadge.SALE);

    const productData: Partial<Product> = {
      title: this.title().trim(),
      subtitle: this.subtitle().trim() || undefined,
      description: this.description().trim(),
      price: this.price(),
      salePrice: this.salePrice() || undefined,
      category: this.category(),
      collection: this.collection(),
      tags: this.tags(),
      images: this.images(),
      variants: this.variants(),
      stock: this.stock(),
      badges,
      isNew: this.isNew(),
      isBestseller: this.isBestseller(),
      isLimitedEdition: this.isLimitedEdition(),
      rating: this.product?.rating || 0,
      reviewCount: this.product?.reviewCount || 0
    };

    if (this.product) {
      // Update existing
      this.adminService.updateProduct(this.product.id, productData).subscribe({
        next: (response: any) => {
          this.save.emit(response.data);
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.errorMessage.set('Failed to update product');
          this.isSaving.set(false);
        }
      });
    } else {
      // Create new
      this.adminService.createProduct(productData as Omit<Product, 'id' | 'createdAt'>).subscribe({
        next: (response: any) => {
          this.save.emit(response.data);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.errorMessage.set('Failed to create product');
          this.isSaving.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
