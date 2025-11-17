# Night Reader - Complete Product Route + Shop Design System

## Brand Mandate
**"Premium merch for those who read by moonlight and train by dawn."**

This shop system extends the Night Reader landing page aesthetic into a fully functional e-commerce experience while maintaining the moody, intellectual, premium brand identity.

---

## 1. Page Structure & Layout

### A) Product Listing Page (`/shop`)

#### Overall Layout Structure

```
┌─────────────────────────────────────────────────┐
│  STICKY HEADER (Night Reader Logo + Nav)        │
├─────────────────────────────────────────────────┤
│  SHOP HERO BANNER                               │
│  "Symbols of the Examined Life"                 │
│  [Quick category pills]                         │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌────────────────────────┐  │
│  │   FILTERS    │  │   MAIN PRODUCT GRID    │  │
│  │   Sidebar    │  │   Sort Bar             │  │
│  │              │  │   ┌────┬────┬────┬────┐│  │
│  │   Category   │  │   │ 1  │ 2  │ 3  │ 4  ││  │
│  │   □ Stickers │  │   ├────┼────┼────┼────┤│  │
│  │   □ Apparel  │  │   │ 5  │ 6  │ 7  │ 8  ││  │
│  │   □ Mugs     │  │   ├────┼────┼────┼────┤│  │
│  │   □ Posters  │  │   │ 9  │ 10 │ 11 │ 12 ││  │
│  │   □ Books    │  │   └────┴────┴────┴────┘│  │
│  │   □ Cases    │  │                        │  │
│  │              │  │   [Load More / Pagination]│
│  │   Collection │  │                        │  │
│  │   □ Dark     │  │                        │  │
│  │     Academia │  │                        │  │
│  │   □ Midnight │  │                        │  │
│  │     Minimal  │  │                        │  │
│  │   □ Mythic   │  │                        │  │
│  │     Fantasy  │  │                        │  │
│  │              │  │                        │  │
│  │   Price      │  │                        │  │
│  │   [slider]   │  │                        │  │
│  └──────────────┘  └────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  FOOTER (from landing page)                     │
└─────────────────────────────────────────────────┘
```

#### Hero Banner Specifications

**Layout:**
- Full-width container, constrained to 1400px max-width
- Height: 40vh (minimum 300px, maximum 500px)
- Background: Gradient from `var(--obsidian)` to `var(--moonlit-blue)` with subtle radial glow overlay
- Centered content with breadcrumb trail at top

**Content:**
- **Breadcrumb:** Home > Shop (small, Inter Light, `var(--steel-grey)`)
- **Title:** "The Collection" or "Night Reader Shop" (Cinzel Bold, 48px desktop)
- **Subtitle:** "Symbols of the examined life" (Cormorant Garamond Italic, 20px, `var(--quicksilver)`)
- **Quick Category Pills:** Horizontal scroll of category shortcuts
  - Pill design: Rounded (`var(--radius-lg)`), border `1px solid var(--steel-grey)`, transparent background
  - Hover: Fill with `var(--candlelight-gold)`, text to `var(--espresso-black)`
  - Typography: Inter Medium, 14px, uppercase, letter-spacing 0.05em

**Visual Elements:**
- Decorative line art: Minimal book/quill icons at corners (subtle, 10% opacity)
- Subtle noise texture overlay (5% opacity)
- Bottom border: 1px solid `var(--slate-charcoal)` with subtle shadow

#### Filter Sidebar (Desktop)

**Dimensions:**
- Width: 280px (fixed)
- Background: `var(--shadow)` with subtle `var(--slate-charcoal)` border
- Padding: `var(--spacing-lg)`
- Border-radius: `var(--radius-md)` on right side
- Position: Sticky (top: 100px to account for header)

**Section Structure:**
Each filter section includes:
- **Section Title:** Inter SemiBold, 16px, `var(--parchment)`, uppercase, margin-bottom `var(--spacing-sm)`
- **Divider:** 1px solid `var(--slate-charcoal)` with 20% opacity, margin `var(--spacing-md)` vertical

**Category Filters:**
- Custom checkboxes styled as small squares (20px × 20px)
- Border: 2px solid `var(--steel-grey)`
- Checked state: Fill with `var(--candlelight-gold)`, checkmark in `var(--espresso-black)`
- Label: Inter Regular, 14px, `var(--moonstone)`
- Spacing: `var(--spacing-sm)` between items
- Hover: Border color changes to `var(--candlelight-gold)`

**Collection Filters:**
- Same checkbox treatment
- Indent slightly from category for visual hierarchy
- Use collection palette colors as small color dots next to labels

**Price Range:**
- Dual-handle slider
- Track color: `var(--slate-charcoal)`
- Handle color: `var(--candlelight-gold)`
- Active track: `var(--ancient-gold)`
- Min/Max display: Inter Medium, `var(--moonstone)`, above slider

**Apply/Clear Buttons:**
- Primary button: "Apply Filters" (full width, `var(--candlelight-gold)` background)
- Ghost button: "Clear All" (text only, `var(--steel-grey)`)

#### Sorting Bar

**Layout:**
- Full width above product grid
- Background: `var(--slate-charcoal)` with subtle gradient to `var(--shadow)`
- Height: 60px
- Padding: `var(--spacing-sm)` `var(--spacing-md)`
- Flex layout: space-between alignment
- Border-bottom: 1px solid `var(--steel-grey)` at 30% opacity

**Left Side:**
- Product count: "Showing 48 of 156 products" (Inter Regular, 14px, `var(--steel-grey)`)

**Right Side:**
- **Sort Label:** "Sort by:" (Inter Medium, 14px, `var(--moonstone)`)
- **Dropdown:**
  - Custom styled select (remove default browser styles)
  - Background: `var(--shadow)`
  - Border: 1px solid `var(--steel-grey)`
  - Padding: 0.5rem 2.5rem 0.5rem 1rem
  - Border-radius: `var(--radius-sm)`
  - Typography: Inter Medium, 14px, `var(--parchment)`
  - Arrow icon: Custom SVG chevron in `var(--candlelight-gold)`
  - Hover: Border color to `var(--candlelight-gold)`, subtle glow
  - Options: Newest, Popular, Price: Low to High, Price: High to Low, Name: A-Z

**View Toggle (Desktop only):**
- Grid/List view icons
- Active state: `var(--candlelight-gold)`
- Inactive: `var(--steel-grey)`
- Size: 24px × 24px, clickable area 44px × 44px

#### Product Grid Layout

**Grid Specifications:**
- **Desktop (>1200px):** 4 columns
- **Tablet (768px-1199px):** 3 columns
- **Mobile (480px-767px):** 2 columns
- **Small Mobile (<480px):** 1 column

**Spacing:**
- Gap between cards: `var(--spacing-md)` (24px)
- Container padding: `var(--spacing-lg)` (32px) on sides
- Margin-top from sorting bar: `var(--spacing-xl)` (48px)

**Background:**
- Base: `var(--midnight-blue)`
- Subtle noise texture overlay (3% opacity)

#### Responsive Behavior

**Mobile (<768px):**
- Filter sidebar becomes bottom sheet modal (slide up from bottom)
- Triggered by "Filters" button in sorting bar
- Full-screen overlay with close button
- Scrollable filter content
- Sticky "Apply" button at bottom

**Tablet (768px-1199px):**
- Filter sidebar collapses to icon drawer (toggleable)
- 3-column grid
- Sorting bar remains

**Desktop (>1200px):**
- Full sidebar visible
- 4-column grid
- All features visible

---

### B) Product Detail Page (`/shop/:id`)

#### Overall Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  STICKY HEADER                                          │
├─────────────────────────────────────────────────────────┤
│  BREADCRUMB: Home > Shop > Category > Product          │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   PRODUCT IMAGE      │   PRODUCT INFO PANEL            │
│   GALLERY            │                                  │
│                      │   [Badge: BESTSELLER]           │
│   ┌────────────────┐│   Title (Large, Cinzel)         │
│   │                ││   Subtitle/Collection            │
│   │   MAIN IMAGE   ││   ★★★★★ (28 reviews)            │
│   │                ││                                  │
│   │     (Zoom)     ││   $24.99                         │
│   │                ││                                  │
│   └────────────────┘│   Description paragraph...      │
│                      │                                  │
│   [Thumb] [Thumb]   │   ┌─────────────────────────┐   │
│   [Thumb] [Thumb]   │   │ Size: □ S □ M ☑ L □ XL │   │
│                      │   │ Color: ◉ Black ○ Navy  │   │
│   Related imagery    │   └─────────────────────────┘   │
│   or lifestyle shots │                                  │
│                      │   Quantity: [-] [1] [+]         │
│                      │                                  │
│                      │   [Add to Cart - Primary BTN]   │
│                      │   [Add to Wishlist - Ghost]     │
│                      │                                  │
│                      │   ─────────────────────────     │
│                      │   📦 Free shipping over $50     │
│                      │   ♻️ Print-on-demand            │
│                      │   ⭐ Premium quality             │
├──────────────────────┴──────────────────────────────────┤
│  TABS: Description | Details | Reviews | Shipping      │
├─────────────────────────────────────────────────────────┤
│  TAB CONTENT (Active tab content here)                  │
├─────────────────────────────────────────────────────────┤
│  "NIGHT READER PICKS" - Recommended Products Carousel   │
│  ┌──────┬──────┬──────┬──────┬──────┐                  │
│  │  1   │  2   │  3   │  4   │  5   │ → (scroll)      │
│  └──────┴──────┴──────┴──────┴──────┘                  │
├─────────────────────────────────────────────────────────┤
│  FOOTER                                                  │
└─────────────────────────────────────────────────────────┘
```

#### Product Image Gallery (Left Panel)

**Main Image Container:**
- Dimensions: 600px × 600px (desktop), maintains 1:1 ratio on mobile
- Background: `var(--slate-charcoal)` with subtle inner shadow
- Border: 1px solid `var(--steel-grey)` at 20% opacity
- Border-radius: `var(--radius-md)`
- Padding: `var(--spacing-sm)` (creates inset frame effect)

**Image Treatment:**
- Object-fit: contain (maintains product visibility)
- Cursor: zoom-in on hover
- Hover effect: Subtle scale (1.05) with smooth transition
- Click: Opens lightbox modal with full-size image

**Thumbnail Strip:**
- Position: Below main image
- Layout: Horizontal scroll (4-5 visible, more scrollable)
- Each thumbnail: 100px × 100px with same border/background treatment
- Active thumbnail: Border color `var(--candlelight-gold)`, glow effect
- Spacing: `var(--spacing-sm)` gap between thumbnails

**Lightbox Modal (Click to Zoom):**
- Full-screen overlay: `var(--pure-black)` at 95% opacity
- Image centered, max 90vw × 90vh
- Close button: Top-right, `var(--parchment)` X icon
- Arrow navigation if multiple images
- Background click to close

**Visual Enhancements:**
- Subtle vignette around main image (creates focus)
- Small decorative corner elements (optional, 5% opacity)

#### Product Info Panel (Right Panel)

**Badge System:**
- Position: Top-left of info panel
- Design: Small pill badge
- Options:
  - **BESTSELLER**: `var(--candlelight-gold)` background, `var(--espresso-black)` text
  - **NEW**: `var(--frost-blue)` background, white text
  - **LIMITED**: `var(--wax-seal-red)` background, white text
- Typography: Inter Bold, 10px, uppercase, letter-spacing 0.1em
- Padding: 4px 12px
- Border-radius: `var(--radius-sm)`

**Product Title:**
- Typography: Cinzel Bold, 36px (desktop), `var(--parchment)`
- Letter-spacing: 0.03em
- Line-height: 1.2
- Margin-bottom: `var(--spacing-sm)`

**Subtitle/Collection:**
- Typography: Cormorant Garamond Italic, 18px, `var(--steel-grey)`
- Example: "From the Dark Academia Collection"
- Margin-bottom: `var(--spacing-md)`

**Star Rating:**
- 5-star display using filled/outlined star icons
- Active stars: `var(--candlelight-gold)`
- Inactive stars: `var(--steel-grey)` at 30% opacity
- Review count: "(28 reviews)" in Inter Regular, 14px, `var(--quicksilver)`
- Clickable to scroll to reviews tab

**Price:**
- Typography: Inter Bold, 32px, `var(--parchment)`
- Margin: `var(--spacing-md)` top and bottom
- If on sale: Original price struck through in `var(--steel-grey)`, sale price in `var(--candlelight-gold)`

**Description:**
- Typography: Inter Regular, 16px, `var(--moonstone)`
- Line-height: 1.8
- Max 3-4 lines before "Read More" link
- "Read More" expands or scrolls to full description tab
- Color: `var(--quicksilver)`, hover to `var(--candlelight-gold)`

**Variant Selectors:**

*Size Selector (if applicable):*
- Label: "Size:" Inter SemiBold, 14px, `var(--parchment)`, uppercase
- Options: Radio-style buttons in horizontal row
- Each option: Square button (50px × 50px)
- Border: 2px solid `var(--steel-grey)`
- Background: `var(--shadow)`
- Typography: Inter Medium, 14px, `var(--moonstone)`
- Selected state: Border `var(--candlelight-gold)`, background `var(--candlelight-gold)` at 20% opacity
- Hover: Border color to `var(--candlelight-gold)`
- Disabled: Opacity 40%, diagonal line through (out of stock)

*Color Selector:*
- Label: "Color:" Inter SemiBold, 14px, `var(--parchment)`, uppercase
- Options: Color swatches (40px × 40px circles)
- Border: 2px solid transparent
- Selected: Border becomes `var(--candlelight-gold)` with outer ring
- Hover: Scale slightly (1.1)

**Quantity Selector:**
- Label: "Quantity:" Inter SemiBold, 14px, `var(--parchment)`, uppercase
- Input group: [-] [Number] [+]
- Buttons: 40px × 40px, background `var(--slate-charcoal)`, border `var(--steel-grey)`
- Number display: Center, Inter Medium, 16px, `var(--parchment)`
- Hover on buttons: Background `var(--candlelight-gold)`, icon color `var(--espresso-black)`
- Max width: 150px

**Add to Cart Button:**
- Full width within info panel
- Height: 56px (generous tap target)
- Background: `var(--candlelight-gold)`
- Typography: Inter Bold, 16px, `var(--espresso-black)`, uppercase, letter-spacing 0.05em
- Border-radius: `var(--radius-md)`
- Hover: Background `var(--ancient-gold)`, lift effect (translateY -2px), glow shadow
- Active/Click: Brief scale animation (0.98)
- Loading state: Spinner replaces text, button disabled

**Add to Wishlist Button:**
- Ghost style (transparent background, border 2px solid `var(--quicksilver)`)
- Full width
- Height: 48px
- Typography: Inter Medium, 14px, `var(--moonstone)`, uppercase
- Icon: Heart outline before text
- Hover: Border and text to `var(--candlelight-gold)`, heart fills
- Margin-top: `var(--spacing-sm)`

**Trust Badges Section:**
- Divider line above: 1px solid `var(--slate-charcoal)`, margin `var(--spacing-lg)` top
- Layout: Vertical stack of 3-4 badges
- Each badge:
  - Icon (24px) + Text
  - Icon color: `var(--candlelight-gold)`
  - Text: Inter Regular, 14px, `var(--steel-grey)`
  - Examples:
    - 📦 "Free shipping over $50"
    - ♻️ "Print-on-demand quality"
    - ⭐ "Premium materials"
    - 🔒 "Secure checkout"
- Spacing: `var(--spacing-sm)` between badges

#### Tabs Section

**Tab Navigation:**
- Layout: Horizontal tabs below product panels
- Background: `var(--slate-charcoal)` with border-bottom 1px `var(--steel-grey)`
- Each tab:
  - Padding: `var(--spacing-md)` `var(--spacing-lg)`
  - Typography: Inter SemiBold, 14px, `var(--steel-grey)`, uppercase
  - Active state: Text `var(--parchment)`, bottom border 3px solid `var(--candlelight-gold)`
  - Hover: Text `var(--moonstone)`
  - Transition: 0.3s ease

**Tab Content Panel:**
- Background: `var(--midnight-blue)`
- Padding: `var(--spacing-2xl)` on all sides
- Min-height: 400px
- Typography: Inter Regular, 16px, `var(--moonstone)`, line-height 1.8

**Tab 1: Description**
- Full product description
- Uses Cormorant Garamond for pull quotes
- Includes product story, use cases, design inspiration
- Example: "Inspired by late-night reading sessions and the quiet discipline of the examined life..."

**Tab 2: Details**
- Structured list:
  - Label (Inter SemiBold, `var(--parchment)`): Value (Inter Regular, `var(--moonstone)`)
  - Examples: Material, Size, Print Method, Care Instructions
- Spacing: `var(--spacing-sm)` between rows

**Tab 3: Reviews**
- Star rating summary at top
- Individual review cards:
  - Background: `var(--slate-charcoal)`
  - Padding: `var(--spacing-md)`
  - Border-radius: `var(--radius-md)`
  - Reviewer name, date, star rating
  - Review text
  - Gap: `var(--spacing-md)` between reviews
- "Write a Review" button at bottom

**Tab 4: Shipping**
- Shipping policies
- Delivery estimates by region
- Return/exchange information
- Typography same as Description tab

#### Recommended Products Carousel

**Section Header:**
- Title: "Night Reader Picks" (Cinzel Bold, 32px, `var(--parchment)`)
- Subtitle: "Readers also bought" (Cormorant Garamond Italic, 18px, `var(--steel-grey)`)
- Centered alignment
- Margin-top: `var(--spacing-2xl)`
- Divider above: Decorative line with small book icon in center

**Carousel Layout:**
- Container: Full width with horizontal scroll
- Visible cards: 5 on desktop, 3 on tablet, 2 on mobile
- Card design: Same as main product grid cards (see Product Card System below)
- Scroll behavior: Smooth horizontal scroll with arrow buttons
- Arrow buttons:
  - Position: Absolute, centered vertically on carousel sides
  - Design: 48px × 48px circles
  - Background: `var(--slate-charcoal)` with 80% opacity
  - Icon: Chevron in `var(--candlelight-gold)`
  - Hover: Background opacity to 100%, icon brightens
- Gap between cards: `var(--spacing-md)`

**Alternative Section Titles:**
- "From the Nightstand Collection"
- "Complete Your Library"
- "The Discipline Bundle"
- "Recommended for You"

#### Responsive Behavior

**Desktop (>1024px):**
- Two-column layout: 50/50 split (image left, info right)
- Sidebar sticky behavior: Info panel sticks as you scroll past image
- Full tab content

**Tablet (768px-1023px):**
- Two-column layout with 40/60 split (smaller image)
- Tabs remain horizontal

**Mobile (<768px):**
- Single column stack: Image → Info
- Image becomes full-width
- Tabs become accordion or vertical stack
- Sticky "Add to Cart" button at bottom of screen when scrolling
- Thumbnails scroll horizontally

---

## 2. Angular Component Architecture

### Component Hierarchy

```
ShopModule
├── shop.routes.ts
├── services/
│   ├── product.service.ts
│   ├── cart.service.ts
│   └── filter.service.ts
├── models/
│   ├── product.model.ts
│   ├── variant.model.ts
│   ├── filter.model.ts
│   └── review.model.ts
├── pipes/
│   ├── currency-format.pipe.ts
│   └── product-filter.pipe.ts
└── components/
    ├── shop-page/
    │   ├── shop-page.component.ts
    │   ├── shop-page.component.html
    │   └── shop-page.component.css
    ├── product-card/
    │   ├── product-card.component.ts
    │   ├── product-card.component.html
    │   └── product-card.component.css
    ├── product-detail/
    │   ├── product-detail.component.ts
    │   ├── product-detail.component.html
    │   └── product-detail.component.css
    ├── category-filters/
    │   ├── category-filters.component.ts
    │   ├── category-filters.component.html
    │   └── category-filters.component.css
    ├── sorting-bar/
    │   ├── sorting-bar.component.ts
    │   ├── sorting-bar.component.html
    │   └── sorting-bar.component.css
    ├── recommended-products/
    │   ├── recommended-products.component.ts
    │   ├── recommended-products.component.html
    │   └── recommended-products.component.css
    ├── product-tabs/
    │   ├── product-tabs.component.ts
    │   ├── product-tabs.component.html
    │   └── product-tabs.component.css
    ├── breadcrumb/
    │   ├── breadcrumb.component.ts
    │   ├── breadcrumb.component.html
    │   └── breadcrumb.component.css
    ├── product-gallery/
    │   ├── product-gallery.component.ts
    │   ├── product-gallery.component.html
    │   └── product-gallery.component.css
    └── variant-selector/
        ├── variant-selector.component.ts
        ├── variant-selector.component.html
        └── variant-selector.component.css
```

### Routing Configuration

**File: `shop.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { ShopPageComponent } from './components/shop-page/shop-page.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

export const shopRoutes: Routes = [
  {
    path: 'shop',
    component: ShopPageComponent,
    data: { breadcrumb: 'Shop' }
  },
  {
    path: 'shop/:category',
    component: ShopPageComponent,
    data: { breadcrumb: 'Category' }
  },
  {
    path: 'shop/product/:id',
    component: ProductDetailComponent,
    data: { breadcrumb: 'Product' }
  }
];
```

### Interface Definitions

**File: `models/product.model.ts`**

```typescript
export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  salePrice?: number;
  category: ProductCategory;
  collection: ProductCollection;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  badges?: ProductBadge[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isLimitedEdition: boolean;
  stock: number;
  createdAt: Date;
}

export enum ProductCategory {
  STICKERS = 'stickers',
  APPAREL = 'apparel',
  MUGS = 'mugs',
  POSTERS = 'posters',
  BOOKMARKS = 'bookmarks',
  PHONE_CASES = 'phone-cases'
}

export enum ProductCollection {
  DARK_ACADEMIA = 'dark-academia',
  MIDNIGHT_MINIMALIST = 'midnight-minimalist',
  MYTHIC_FANTASY = 'mythic-fantasy'
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  colorHex?: string;
  price?: number;
  stock: number;
  sku: string;
}

export enum ProductBadge {
  NEW = 'new',
  BESTSELLER = 'bestseller',
  LIMITED = 'limited',
  SALE = 'sale'
}
```

**File: `models/filter.model.ts`**

```typescript
export interface FilterState {
  categories: ProductCategory[];
  collections: ProductCollection[];
  priceRange: PriceRange;
  sortBy: SortOption;
}

export interface PriceRange {
  min: number;
  max: number;
}

export enum SortOption {
  NEWEST = 'newest',
  POPULAR = 'popular',
  PRICE_LOW_HIGH = 'price-asc',
  PRICE_HIGH_LOW = 'price-desc',
  NAME_A_Z = 'name-asc'
}
```

**File: `models/review.model.ts`**

```typescript
export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  createdAt: Date;
  verified: boolean;
}
```

### Component Specifications

#### 1. ShopPageComponent

**Responsibility:** Container component for the product listing page

**Inputs:** None (uses route params)

**Outputs:** None

**Key Features:**
- Manages filter state
- Subscribes to ProductService for product list
- Handles pagination
- Responds to filter/sort changes

**Template Structure:**
```html
<div class="shop-page">
  <div class="shop-hero">
    <breadcrumb></breadcrumb>
    <h1>The Collection</h1>
    <p>Symbols of the examined life</p>
    <!-- Quick category pills -->
  </div>

  <div class="shop-container">
    <category-filters
      [filters]="filters"
      (filterChange)="onFilterChange($event)">
    </category-filters>

    <div class="shop-main">
      <sorting-bar
        [productCount]="products.length"
        [totalCount]="totalProducts"
        (sortChange)="onSortChange($event)">
      </sorting-bar>

      <div class="product-grid">
        <product-card
          *ngFor="let product of products"
          [product]="product"
          (addToCart)="onAddToCart($event)">
        </product-card>
      </div>

      <div class="pagination">
        <!-- Pagination controls -->
      </div>
    </div>
  </div>
</div>
```

**TypeScript:**
```typescript
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, FilterState, SortOption } from '../../models';

@Component({
  selector: 'shop-page',
  templateUrl: './shop-page.component.html',
  styleUrl: './shop-page.component.css'
})
export class ShopPageComponent implements OnInit {
  products = signal<Product[]>([]);
  totalProducts = signal<number>(0);
  filters = signal<FilterState>({
    categories: [],
    collections: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: SortOption.NEWEST
  });

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts(this.filters()).subscribe(result => {
      this.products.set(result.products);
      this.totalProducts.set(result.total);
    });
  }

  onFilterChange(newFilters: FilterState) {
    this.filters.set(newFilters);
    this.loadProducts();
  }

  onSortChange(sortOption: SortOption) {
    this.filters.update(f => ({ ...f, sortBy: sortOption }));
    this.loadProducts();
  }

  onAddToCart(product: Product) {
    // Handle quick add to cart
  }
}
```

#### 2. ProductCardComponent

**Responsibility:** Display individual product in grid

**Inputs:**
- `product: Product` - Product data
- `layout?: 'grid' | 'list'` - Display mode (default: grid)

**Outputs:**
- `addToCart: EventEmitter<Product>` - Quick add event
- `viewProduct: EventEmitter<string>` - Navigate to detail

**Template:**
```html
<div class="product-card" [class.list-view]="layout === 'list'">
  <div class="product-image-wrapper">
    <img [src]="product.images[0].url" [alt]="product.images[0].alt" />
    <div class="product-badges">
      <span *ngIf="product.isNew" class="badge badge-new">NEW</span>
      <span *ngIf="product.isBestseller" class="badge badge-bestseller">BESTSELLER</span>
    </div>
    <div class="product-overlay">
      <button class="btn-quick-view" (click)="viewProduct.emit(product.id)">
        Quick View
      </button>
    </div>
  </div>

  <div class="product-info">
    <p class="product-collection">{{ product.collection }}</p>
    <h3 class="product-title">{{ product.title }}</h3>
    <div class="product-rating">
      <star-rating [rating]="product.rating"></star-rating>
      <span class="review-count">({{ product.reviewCount }})</span>
    </div>
    <div class="product-price">
      <span class="current-price">{{ product.price | currency }}</span>
      <span *ngIf="product.salePrice" class="original-price">
        {{ product.salePrice | currency }}
      </span>
    </div>
    <button class="btn-add-cart" (click)="addToCart.emit(product)">
      Add to Cart
    </button>
  </div>
</div>
```

#### 3. ProductDetailComponent

**Responsibility:** Full product detail page

**Inputs:** None (uses route param for product ID)

**Outputs:** None

**Key Features:**
- Loads product by ID from route
- Manages selected variant
- Handles quantity
- Add to cart functionality
- Tab navigation
- Recommended products

**Major Sections:**
- Breadcrumb navigation
- Product gallery (separate component)
- Product info panel
- Variant selectors (separate component)
- Tabs (separate component)
- Recommended products carousel (separate component)

#### 4. CategoryFiltersComponent

**Responsibility:** Filter sidebar

**Inputs:**
- `filters: FilterState` - Current filter state

**Outputs:**
- `filterChange: EventEmitter<FilterState>` - Emit on apply

**Key Features:**
- Checkboxes for categories and collections
- Price range slider
- Apply/Clear buttons
- Mobile: Renders as bottom sheet modal

#### 5. SortingBarComponent

**Responsibility:** Sort controls and product count

**Inputs:**
- `productCount: number` - Shown products
- `totalCount: number` - Total matching products

**Outputs:**
- `sortChange: EventEmitter<SortOption>` - Emit on sort change

#### 6. RecommendedProductsComponent

**Responsibility:** Horizontal scrolling carousel

**Inputs:**
- `products: Product[]` - Products to display
- `title: string` - Section title (default: "Night Reader Picks")

**Outputs:**
- None (cards handle their own navigation)

**Key Features:**
- Horizontal scroll
- Arrow navigation
- Responsive card count

#### 7. BreadcrumbComponent

**Responsibility:** Navigation breadcrumb trail

**Inputs:**
- Auto-generated from route data

**Output:**
- Navigation via routerLink

#### 8. ProductGalleryComponent

**Responsibility:** Image display and lightbox

**Inputs:**
- `images: ProductImage[]` - Product images

**Outputs:**
- None

**Key Features:**
- Main image display
- Thumbnail navigation
- Zoom on hover
- Lightbox modal on click

#### 9. VariantSelectorComponent

**Responsibility:** Size/color selection

**Inputs:**
- `variants: ProductVariant[]` - Available variants
- `selectedVariant: ProductVariant` - Current selection

**Outputs:**
- `variantChange: EventEmitter<ProductVariant>` - Emit on select

### Service Design

**File: `services/product.service.ts`**

```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, FilterState } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(filters: FilterState): Observable<{ products: Product[], total: number }> {
    return this.http.get<any>(this.apiUrl, {
      params: this.buildParams(filters)
    });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getRecommendedProducts(productId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/${productId}/recommended`);
  }

  private buildParams(filters: FilterState): any {
    return {
      categories: filters.categories.join(','),
      collections: filters.collections.join(','),
      minPrice: filters.priceRange.min,
      maxPrice: filters.priceRange.max,
      sortBy: filters.sortBy
    };
  }
}
```

**File: `services/cart.service.ts`**

```typescript
import { Injectable, signal } from '@angular/core';
import { Product, ProductVariant } from '../models';

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart = signal<CartItem[]>([]);

  addToCart(product: Product, variant?: ProductVariant, quantity: number = 1) {
    const existing = this.cart().find(item =>
      item.product.id === product.id &&
      item.variant?.id === variant?.id
    );

    if (existing) {
      this.updateQuantity(product.id, variant?.id, existing.quantity + quantity);
    } else {
      this.cart.update(items => [...items, { product, variant, quantity }]);
    }
  }

  updateQuantity(productId: string, variantId: string | undefined, quantity: number) {
    this.cart.update(items =>
      items.map(item =>
        item.product.id === productId && item.variant?.id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  }

  removeFromCart(productId: string, variantId?: string) {
    this.cart.update(items =>
      items.filter(item =>
        !(item.product.id === productId && item.variant?.id === variantId)
      )
    );
  }

  getCart() {
    return this.cart;
  }

  getTotal(): number {
    return this.cart().reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }
}
```

---

## 3. Visual Design Guidelines (Night Reader Theme)

### Design Token System

**Spacing Scale:**
```css
--spacing-3xs: 0.25rem;  /* 4px */
--spacing-2xs: 0.5rem;   /* 8px */
--spacing-xs: 0.75rem;   /* 12px */
--spacing-sm: 1rem;      /* 16px */
--spacing-md: 1.5rem;    /* 24px */
--spacing-lg: 2rem;      /* 32px */
--spacing-xl: 3rem;      /* 48px */
--spacing-2xl: 4rem;     /* 64px */
--spacing-3xl: 6rem;     /* 96px */
```

**Typography Scale (from global):**
- H1: 56px (Cinzel Bold) - Page titles
- H2: 42px (Cinzel Regular) - Section headers
- H3: 32px (Inter SemiBold) - Product titles (detail page)
- H4: 24px (Inter Medium) - Product titles (cards)
- H5: 20px (Inter Medium) - Subsections
- Body Large: 18px (Inter Regular) - Descriptions
- Body: 16px (Inter Regular) - Default text
- Body Small: 14px (Inter Regular) - Meta info
- Caption: 12px (Inter Regular) - Labels, badges

**Color Usage Guide:**

*Primary Actions:*
- Buttons: `var(--candlelight-gold)` background, `var(--espresso-black)` text
- Hover: `var(--ancient-gold)`
- Active/Selected: `var(--candlelight-gold)` with glow

*Secondary Actions:*
- Ghost buttons: Transparent with `var(--quicksilver)` border
- Hover: Border and text to `var(--candlelight-gold)`

*Backgrounds:*
- Page base: `var(--midnight-blue)`
- Elevated cards: `var(--slate-charcoal)`
- Sidebar/panels: `var(--shadow)`
- Overlays: `var(--obsidian)` at 95% opacity

*Text Hierarchy:*
- Primary headings: `var(--parchment)`
- Body text: `var(--moonstone)`
- Secondary/meta: `var(--steel-grey)`
- Disabled: `var(--storm-grey)` at 40% opacity
- Links: `var(--candlelight-gold)`, hover `var(--ancient-gold)`

*Borders & Dividers:*
- Subtle borders: `var(--slate-charcoal)` or `var(--steel-grey)` at 20-30% opacity
- Accent borders: `var(--candlelight-gold)`

**Corner Radius:**
```css
--radius-sm: 4px;   /* Input fields, small buttons */
--radius-md: 8px;   /* Cards, buttons, images */
--radius-lg: 12px;  /* Large containers, modals */
--radius-xl: 16px;  /* Hero sections */
```

**Shadows & Elevation:**
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1);      /* Subtle lift */
--shadow-md: 0 4px 8px rgba(0,0,0,0.15);     /* Standard cards */
--shadow-lg: 0 8px 16px rgba(0,0,0,0.2);     /* Hover state */
--shadow-xl: 0 12px 24px rgba(0,0,0,0.25);   /* Modals */
--glow-gold: 0 0 20px rgba(212,165,116,0.3); /* Accent glow */
```

**Line Weights:**
- Hairline: 1px (dividers)
- Thin: 2px (borders, inputs)
- Medium: 3px (active states, accent underlines)
- Bold: 4px (decorative elements)

**Transitions:**
```css
--transition-fast: 0.15s ease;    /* Micro-interactions */
--transition-normal: 0.3s ease;   /* Standard hovers */
--transition-slow: 0.5s ease;     /* Page transitions */
```

### Button Styles (Extended)

**Primary Button:**
```css
.btn-primary {
  background: var(--candlelight-gold);
  color: var(--espresso-black);
  padding: 0.75rem 2rem;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-primary:hover {
  background: var(--ancient-gold);
  transform: translateY(-2px);
  box-shadow: var(--glow-gold);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: transparent;
  color: var(--quicksilver);
  border: 2px solid var(--quicksilver);
  padding: 0.75rem 2rem;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--body);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-secondary:hover {
  background: var(--quicksilver);
  color: var(--midnight-blue);
}
```

**Ghost Button:**
```css
.btn-ghost {
  background: transparent;
  color: var(--steel-grey);
  border: none;
  padding: 0.5rem 1rem;
  font-family: var(--font-body);
  font-size: var(--body-small);
  text-decoration: underline;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.btn-ghost:hover {
  color: var(--candlelight-gold);
}
```

**Icon Button:**
```css
.btn-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slate-charcoal);
  border: 1px solid var(--steel-grey);
  border-radius: var(--radius-md);
  color: var(--moonstone);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-icon:hover {
  background: var(--candlelight-gold);
  color: var(--espresso-black);
  border-color: var(--candlelight-gold);
}
```

### Micro-Interactions

**Card Hover Effect:**
```css
.product-card {
  transition: all var(--transition-normal);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.product-card:hover .product-overlay {
  opacity: 1;
}
```

**Button Click Animation:**
```css
@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.97); }
  100% { transform: scale(1); }
}

.btn-primary:active {
  animation: buttonPress 0.2s ease;
}
```

**Loading Spinner:**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--slate-charcoal);
  border-top-color: var(--candlelight-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

**Image Zoom on Hover:**
```css
.product-image-wrapper {
  overflow: hidden;
  border-radius: var(--radius-md);
}

.product-image-wrapper img {
  transition: transform var(--transition-slow);
}

.product-image-wrapper:hover img {
  transform: scale(1.1);
}
```

### Textures & Overlays

**Subtle Noise Texture:**
```css
.textured-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;base64,...'); /* noise pattern */
  opacity: 0.03;
  pointer-events: none;
}
```

**Gradient Overlays:**
```css
.hero-gradient {
  background: linear-gradient(
    135deg,
    var(--obsidian) 0%,
    var(--midnight-blue) 50%,
    var(--moonlit-blue) 100%
  );
}

.card-gradient {
  background: linear-gradient(
    180deg,
    var(--slate-charcoal) 0%,
    var(--shadow) 100%
  );
}
```

**Vignette Effect:**
```css
.vignette::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    transparent 50%,
    rgba(0,0,0,0.3) 100%
  );
  pointer-events: none;
}
```

---

## 4. Product Card System

### Card Specifications

**Dimensions:**
- Aspect ratio: 3:4 (portrait orientation)
- Desktop width: Calculated by grid (4 columns)
- Mobile width: Full width minus padding

**Structure:**
```
┌─────────────────────────┐
│  [Badge: NEW]           │
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │  PRODUCT IMAGE  │   │
│   │                 │   │
│   │  (Hover overlay)│   │
│   └─────────────────┘   │
│                         │
│   Collection Name       │
│   Product Title         │
│   ★★★★☆ (12)           │
│   $24.99 [$29.99]       │
│                         │
│   [Add to Cart BTN]     │
└─────────────────────────┘
```

**Card Container:**
```css
.product-card {
  background: var(--slate-charcoal);
  border: 1px solid var(--steel-grey);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--candlelight-gold);
}
```

**Image Section:**
```css
.product-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--shadow);
  overflow: hidden;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.product-card:hover .product-image-wrapper img {
  transform: scale(1.08);
}
```

**Badge Overlay:**
```css
.product-badges {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-2xs);
  z-index: 2;
}

.badge {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.badge-new {
  background: var(--frost-blue);
  color: white;
}

.badge-bestseller {
  background: var(--candlelight-gold);
  color: var(--espresso-black);
}

.badge-limited {
  background: var(--wax-seal-red);
  color: white;
}

.badge-sale {
  background: var(--oxblood);
  color: var(--parchment);
}
```

**Hover Overlay:**
```css
.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.8) 0%,
    rgba(0,0,0,0.4) 50%,
    transparent 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.btn-quick-view {
  background: var(--candlelight-gold);
  color: var(--espresso-black);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  transform: translateY(10px);
  transition: all var(--transition-normal);
}

.product-card:hover .btn-quick-view {
  transform: translateY(0);
}
```

**Info Section:**
```css
.product-info {
  padding: var(--spacing-md);
}

.product-collection {
  font-family: var(--font-accent);
  font-style: italic;
  font-size: var(--body-small);
  color: var(--steel-grey);
  margin-bottom: var(--spacing-2xs);
  text-transform: capitalize;
}

.product-title {
  font-family: var(--font-header);
  font-size: var(--h5);
  font-weight: 600;
  color: var(--parchment);
  margin-bottom: var(--spacing-xs);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
  margin-bottom: var(--spacing-sm);
}

.review-count {
  font-family: var(--font-body);
  font-size: var(--body-small);
  color: var(--quicksilver);
}
```

**Price Display:**
```css
.product-price {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.current-price {
  font-family: var(--font-body);
  font-size: var(--h5);
  font-weight: 700;
  color: var(--parchment);
}

.original-price {
  font-family: var(--font-body);
  font-size: var(--body);
  color: var(--steel-grey);
  text-decoration: line-through;
}

.product-price.on-sale .current-price {
  color: var(--candlelight-gold);
}
```

**Add to Cart Button:**
```css
.btn-add-cart {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  color: var(--candlelight-gold);
  border: 2px solid var(--candlelight-gold);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-add-cart:hover {
  background: var(--candlelight-gold);
  color: var(--espresso-black);
  transform: translateY(-2px);
  box-shadow: var(--glow-gold);
}
```

### Star Rating Component

```css
.star-rating {
  display: flex;
  gap: 2px;
}

.star {
  width: 16px;
  height: 16px;
  color: var(--candlelight-gold);
}

.star.empty {
  color: var(--steel-grey);
  opacity: 0.3;
}
```

### Consistency Guidelines

**Across All Product Cards:**
1. **Typography:** Always Cinzel for titles, Inter for meta
2. **Spacing:** Consistent padding (`var(--spacing-md)`) in info section
3. **Colors:** Collection name always `var(--steel-grey)`, title always `var(--parchment)`
4. **Badges:** Position top-left, same size and styling
5. **Hover:** Consistent lift effect (-8px) and shadow
6. **Images:** Always 1:1 aspect ratio, centered, cover fit
7. **Buttons:** Same styling across all cards

**Category-Specific Variations:**

While maintaining core consistency, subtle variations by category:

- **Stickers:** Smaller cards work well, emphasize iconography
- **Apparel:** Show color swatches on hover overlay
- **Mugs/Cases:** Show 360° rotation icon on hover
- **Posters:** Larger image ratio (taller cards)
- **Bookmarks:** Show size dimensions prominently

---

## 5. E-Commerce UX Features

### Breadcrumb Navigation

**Placement:** Top of page, below header
**Structure:** Home > Shop > [Category] > [Product]

```css
.breadcrumb {
  padding: var(--spacing-sm) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: var(--font-body);
  font-size: var(--body-small);
}

.breadcrumb-item {
  color: var(--steel-grey);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.breadcrumb-item:hover {
  color: var(--candlelight-gold);
}

.breadcrumb-separator {
  color: var(--storm-grey);
}

.breadcrumb-item.active {
  color: var(--parchment);
  pointer-events: none;
}
```

### Quick Add to Cart

**Functionality:**
- Click "Add to Cart" on card → adds default variant
- If product has variants → opens quick-select modal
- Success feedback: Brief checkmark animation + cart icon badge updates

**Quick Select Modal:**
```
┌─────────────────────────────────┐
│  ✕  Quick Add                   │
├─────────────────────────────────┤
│  [Product Image] | Product Title│
│                  | $24.99       │
│                  |              │
│                  | Size: □ S □ M│
│                  | Color: ◉ ○ ○ │
│                  | Qty: [1]     │
│                  |              │
│                  | [Add to Cart]│
└─────────────────────────────────┘
```

```css
.quick-add-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--slate-charcoal);
  border: 1px solid var(--candlelight-gold);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  z-index: 1001;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
}
```

### Variant Preview on Hover

**Image Swap:**
- Hover over color swatch → main image swaps to that color variant
- Smooth fade transition (0.3s)

**Stock Indicator:**
```css
.variant-stock {
  font-size: var(--body-small);
  color: var(--steel-grey);
}

.variant-stock.low-stock {
  color: var(--wax-seal-red);
}

.variant-stock.out-of-stock {
  color: var(--storm-grey);
  text-decoration: line-through;
}
```

### Sticky Add to Cart (Mobile)

**On Product Detail Page:**
- When scrolling past "Add to Cart" button → sticky version appears at bottom
- Includes: Product image thumbnail, price, quantity selector, button
- Slides up from bottom with smooth animation

```css
.sticky-cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--shadow);
  border-top: 1px solid var(--candlelight-gold);
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: 0 -4px 12px rgba(0,0,0,0.3);
  transform: translateY(100%);
  transition: transform var(--transition-normal);
  z-index: 100;
}

.sticky-cart-bar.visible {
  transform: translateY(0);
}
```

### CTA Hierarchy

**Priority Levels:**

1. **Primary CTA:** Add to Cart (always `var(--candlelight-gold)` button)
2. **Secondary CTA:** Quick View, Wishlist (ghost or outline style)
3. **Tertiary CTA:** Share, Compare (icon-only, minimal)

**Placement Rules:**
- Primary always most prominent (larger, filled)
- Secondary below or beside primary, less visual weight
- Tertiary tucked in corners or dropdowns

### Trust Badges

**Subtle Integration:**
- Small icons + text (not large badge images)
- Placed in footer of product detail page
- Consistent iconography (line art style)

```css
.trust-badges {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--slate-charcoal);
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.trust-badge-icon {
  width: 24px;
  height: 24px;
  color: var(--candlelight-gold);
}

.trust-badge-text {
  font-family: var(--font-body);
  font-size: var(--body-small);
  color: var(--steel-grey);
}
```

### Loading Skeletons

**For Product Cards:**
```css
.skeleton-card {
  background: var(--slate-charcoal);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: linear-gradient(
    90deg,
    var(--shadow) 0%,
    var(--slate-charcoal) 50%,
    var(--shadow) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  height: 16px;
  background: var(--shadow);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-xs);
  animation: shimmer 1.5s infinite;
}
```

### Empty State Designs

**No Products Found:**
```
┌─────────────────────────────────┐
│                                 │
│         🌙                      │
│    "Nothing found in the        │
│     quiet hours..."             │
│                                 │
│  No products match your filters │
│  Try adjusting your search      │
│                                 │
│  [Clear Filters]                │
│                                 │
└─────────────────────────────────┘
```

```css
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.3;
}

.empty-state-title {
  font-family: var(--font-accent);
  font-size: var(--h3);
  font-style: italic;
  color: var(--parchment);
  margin-bottom: var(--spacing-sm);
}

.empty-state-message {
  font-family: var(--font-body);
  font-size: var(--body);
  color: var(--steel-grey);
  margin-bottom: var(--spacing-lg);
}
```

**Empty Cart:**
```
┌─────────────────────────────────┐
│         📚                      │
│  "Your collection awaits..."    │
│                                 │
│  Add items to begin building    │
│  your Night Reader library      │
│                                 │
│  [Browse Collection]            │
└─────────────────────────────────┘
```

---

## 6. Responsive Design

### Breakpoint System

```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 480px;   /* Small mobile */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1200px;  /* Wide desktop */
  --breakpoint-2xl: 1400px; /* Ultra-wide */
}
```

### Layout Adaptations

#### Mobile (<768px)

**Shop Page:**
- Filter sidebar → Bottom sheet modal (triggered by button)
- Product grid: 1-2 columns (2 on landscape, 1 on portrait)
- Sorting bar: Stacked layout (count top, sort bottom)
- Typography: Scaled down via CSS variables

```css
@media (max-width: 767px) {
  :root {
    --h1: 32px;
    --h2: 28px;
    --h3: 24px;
    --h4: 20px;
    --h5: 18px;
  }

  .shop-container {
    display: block; /* No sidebar */
  }

  .filter-sidebar {
    display: none; /* Hidden by default */
  }

  .filter-modal {
    display: block; /* Shown when activated */
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-sm);
  }

  .sorting-bar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
}
```

**Product Detail:**
- Single column stack: Image → Info
- Gallery thumbnails: Horizontal scroll
- Tabs: Accordion style (collapsible sections instead of tabs)
- Sticky "Add to Cart" bar at bottom when scrolling

```css
@media (max-width: 767px) {
  .product-detail-layout {
    display: block; /* Stack vertically */
  }

  .product-gallery {
    margin-bottom: var(--spacing-lg);
  }

  .product-info-panel {
    padding: var(--spacing-md);
  }

  .product-tabs {
    display: none; /* Replace with accordion */
  }

  .product-accordion {
    display: block;
  }

  .sticky-cart-bar {
    display: flex; /* Activate sticky bar */
  }
}
```

#### Tablet (768px - 1023px)

**Shop Page:**
- Sidebar: Toggleable drawer (icon button to open/close)
- Product grid: 3 columns
- Sorting bar: Horizontal layout maintained
- Hero banner: Slightly reduced height

```css
@media (min-width: 768px) and (max-width: 1023px) {
  .filter-sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 999;
    transition: left var(--transition-normal);
  }

  .filter-sidebar.open {
    left: 0;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .shop-hero {
    min-height: 30vh;
  }
}
```

**Product Detail:**
- Two-column: 40% image, 60% info
- Gallery thumbnails: Vertical on left side of main image
- Tabs: Horizontal (maintained)

```css
@media (min-width: 768px) and (max-width: 1023px) {
  .product-detail-layout {
    display: grid;
    grid-template-columns: 40% 60%;
    gap: var(--spacing-lg);
  }
}
```

#### Desktop (1024px - 1199px)

**Shop Page:**
- Sidebar: Fully visible, 280px fixed width
- Product grid: 3-4 columns (depends on container)
- All features visible

```css
@media (min-width: 1024px) and (max-width: 1199px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Product Detail:**
- Two-column: 50/50 split
- Gallery: Thumbnails below main image
- Full tab layout

#### Wide Desktop (>1200px)

**Shop Page:**
- Product grid: 4 columns
- Max container width: 1400px
- Generous spacing

```css
@media (min-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .shop-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

**Product Detail:**
- Max content width: 1200px
- Image gallery: Large display (600px)
- Recommended carousel: 5 visible products

### Typography Adjustments

```css
/* Mobile */
@media (max-width: 767px) {
  :root {
    --h1: 32px;
    --h2: 28px;
    --h3: 24px;
    --h4: 20px;
    --h5: 18px;
    --body-large: 16px;
    --body: 15px;
    --body-small: 13px;
  }

  .product-title {
    -webkit-line-clamp: 2; /* Limit to 2 lines */
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  :root {
    --h1: 42px;
    --h2: 36px;
    --h3: 28px;
    --h4: 22px;
  }
}

/* Desktop - use default values */
```

### Spacing Adjustments

```css
/* Mobile: Tighter spacing */
@media (max-width: 767px) {
  :root {
    --spacing-sm: 0.75rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
  }

  .container {
    padding: 0 var(--spacing-sm);
  }
}

/* Tablet: Medium spacing */
@media (min-width: 768px) and (max-width: 1023px) {
  :root {
    --spacing-xl: 2.5rem;
    --spacing-2xl: 3.5rem;
  }
}
```

### Button Sizing

```css
/* Mobile: Larger tap targets */
@media (max-width: 767px) {
  .btn {
    min-height: 48px; /* Increased from 44px */
    padding: 0.875rem 1.5rem;
    font-size: 15px;
  }

  .btn-icon {
    width: 48px;
    height: 48px;
  }
}
```

### Image Scaling

```css
/* Maintain aspect ratios across all sizes */
.product-image-wrapper {
  aspect-ratio: 1 / 1; /* Always square */
}

/* Product detail main image */
@media (max-width: 767px) {
  .product-main-image {
    max-width: 100%;
    height: auto;
  }
}

@media (min-width: 768px) {
  .product-main-image {
    width: 100%;
    max-width: 600px;
  }
}
```

---

## 7. Brand Consistency

### Color Palette Integration

**Landing Page → Shop Continuity:**

The shop uses the same three Night Reader palettes established on the landing page:

1. **Dark Academia** (`var(--parchment)`, `var(--espresso-black)`, `var(--candlelight-gold)`, `var(--oxblood)`)
   - Used for: Product cards with literary themes, quote-based stickers, bookmarks
   - Accent color: `var(--candlelight-gold)` for CTAs

2. **Nighttime Minimalist** (`var(--midnight-blue)`, `var(--slate-charcoal)`, `var(--steel-grey)`, `var(--moonstone)`)
   - Used for: Main backgrounds, UI chrome, modern product lines
   - Primary background throughout shop

3. **Mythic Fantasy** (`var(--obsidian)`, `var(--midnight-purple)`, `var(--moonlit-blue)`, `var(--ancient-gold)`)
   - Used for: Hero sections, special collection highlights, fantasy-themed products
   - Gradient overlays

**Application Rules:**
- All backgrounds remain dark (`var(--midnight-blue)` base)
- Card elevation uses `var(--slate-charcoal)`
- Primary actions always `var(--candlelight-gold)`
- Text hierarchy: `var(--parchment)` → `var(--moonstone)` → `var(--steel-grey)`

### Typography Consistency

**Maintained from Landing:**

- **Headers:** Cinzel (serif, classical)
  - Page titles (H1): Cinzel Bold
  - Section headers (H2): Cinzel Regular
  - Product titles on detail page (H3): Cinzel Bold

- **Body:** Inter (sans-serif, modern)
  - All UI text, descriptions, metadata
  - Buttons, labels, form fields

- **Accents:** Cormorant Garamond (serif, literary)
  - Collection names
  - Pull quotes in product descriptions
  - Taglines and romantic copy

**Hierarchy Maintained:**
```
Landing:  NIGHT READER (Cinzel) → "Read Deep. Train Hard." (Cinzel) → Description (Inter)
Shop:     THE COLLECTION (Cinzel) → Product Title (Cinzel) → Description (Inter)
Product:  Product Name (Cinzel) → "From Dark Academia" (Cormorant) → Details (Inter)
```

### Iconography Style

**Consistent Visual Language:**

All icons follow the same style from landing page:
- **Line art style:** Simple, clean strokes
- **Weight:** Medium (2-3px stroke)
- **Style:** Minimal, geometric with slight organic curves
- **Color:** Single color (no gradients in icons)
  - Default: `var(--steel-grey)`
  - Active/hover: `var(--candlelight-gold)`

**Icon Set:**
- 📚 Book (product category, literary theme)
- 🌙 Moon (nighttime theme, collections)
- ⭐ Star (ratings, favorites)
- 🛒 Cart (shopping)
- ❤️ Heart (wishlist)
- 🔍 Search/Zoom
- ⚡ Quick view
- 🎨 Color palette
- 📏 Size ruler
- ✓ Checkmark (confirmation)
- ✕ Close
- ← → Arrows (navigation)
- ⬇ Chevron (dropdowns)

**Usage:**
- Size: 24px default (20px small, 32px large)
- Padding: 8-12px around icon for click targets
- Never use colored/gradient icons
- Consistent stroke weight across all icons

### Photo Style Guidelines

**Product Photography:**

To maintain Night Reader's moody, premium aesthetic:

**Lighting:**
- Low-key lighting (dark backgrounds, dramatic shadows)
- Avoid bright, flat lighting
- Emulate candlelight or dawn/dusk natural light
- Shadows should be present but not harsh

**Backgrounds:**
- Dark surfaces: charcoal, navy, black
- Textured backgrounds: wood, leather, fabric
- Minimal, uncluttered
- Never white or bright colors

**Composition:**
- Centered or rule-of-thirds
- Generous negative space
- Flat lays or slight angle (30-45°)
- Props: Books, coffee, candles, journals (never distracting)

**Color Grading:**
- Desaturated slightly
- Cool-toned shadows (blue/purple tint)
- Warm highlights (amber/gold tint)
- Contrast: Medium-high
- Vignette: Subtle darkening at edges

**Examples:**
- Sticker on dark leather notebook
- Mug on wooden desk with book in background
- T-shirt flat lay on charcoal fabric
- Poster leaning against books on shelf

**Consistency Check:**
All photos should feel like they belong in the same "night study" environment.

### Background Motifs

**Decorative Elements (Subtle):**

Carried over from landing page, used sparingly:

1. **Constellation patterns** - Faint star/dot connections in backgrounds (2-5% opacity)
2. **Book spine texture** - Vertical lines suggesting bookshelf in hero sections
3. **Quill/pen line art** - Corner decorations on section dividers
4. **Moon phases** - Small icons in collection badges or section headers
5. **Geometric patterns** - Subtle triangles, hexagons as texture overlays

**Application:**
- Hero sections: Radial glows (purple, gold) at 5-10% opacity
- Section dividers: Thin decorative lines with small central icon
- Card backgrounds: Subtle noise texture (3% opacity)
- Empty states: Larger icon illustrations (20-30% opacity)

**DO NOT:**
- Overuse decorative elements (less is more)
- Use bright, saturated decorations
- Compete with product photography
- Create visual clutter

### Thematic Visuals

**Collection-Specific Themes:**

Each collection maintains visual consistency:

**Dark Academia Collection:**
- Icons: 📚 Books, 🖋️ Quills, 📜 Scrolls, 🕯️ Candles
- Colors: Parchment, Espresso, Oxblood, Candlelight Gold
- Photos: Vintage books, aged paper, leather
- Typography emphasis: Serif (Cinzel, Cormorant)

**Midnight Minimalist Collection:**
- Icons: 🌙 Moon, ⭐ Stars, ◇ Geometric shapes
- Colors: Midnight Blue, Slate, Steel Grey, Quicksilver
- Photos: Clean surfaces, modern angles, negative space
- Typography emphasis: Sans-serif (Inter)

**Mythic Fantasy Collection:**
- Icons: ⚔️ Swords, 🛡️ Shields, 🦉 Owls, ᚱ Runes
- Colors: Obsidian, Midnight Purple, Ancient Gold, Moonlit Blue
- Photos: Dramatic lighting, mysterious atmosphere
- Typography emphasis: Mix of Cinzel + decorative elements

**Cross-Collection Cohesion:**
All three collections share:
- Dark, moody base aesthetic
- Premium quality feel
- Nighttime/contemplative vibe
- Same typography system
- Same button/UI treatments

---

## 8. Final Summary

### The Complete Night Reader Shop Experience

The Night Reader shop system is a seamless extension of the brand's landing page, creating a premium, cohesive e-commerce experience that feels like browsing a curated collection in a candlelit library at midnight.

### How the System Reinforces the Brand

**1. Visual Continuity**
- Same color palettes (Dark Academia, Nighttime Minimalist, Mythic Fantasy)
- Same typography hierarchy (Cinzel, Inter, Cormorant Garamond)
- Same moody, dark aesthetic with midnight blue backgrounds
- Same gold accent color (`var(--candlelight-gold)`) for all CTAs

**2. Emotional Consistency**
- Landing: "Read Deep. Train Hard. Build Yourself."
- Shop: "Symbols of the Examined Life"
- Product Detail: "From the Dark Academia Collection"
- Cart: "Your Collection Awaits"

Every piece of copy maintains the contemplative, disciplined, intellectual tone.

**3. Functional Excellence**
- Intuitive filtering by category and collection
- Clear product hierarchy with badges (NEW, BESTSELLER, LIMITED)
- Smooth micro-interactions (hover effects, transitions, animations)
- Mobile-optimized with sticky CTAs and bottom sheet filters
- Fast loading with skeleton states

**4. Premium Positioning**
- High-quality product photography with dramatic lighting
- Generous whitespace and breathing room
- Subtle decorative elements (never cluttered)
- Refined typography with proper hierarchy
- Trust badges integrated tastefully

**5. Brand Storytelling**
- Each product has collection context ("From the Dark Academia Collection")
- Product descriptions tie to Night Reader philosophy
- Recommended products use thematic language ("Night Reader Picks", "From the Nightstand")
- Empty states maintain brand voice ("Nothing found in the quiet hours...")

**6. Technical Sophistication**
- Angular component architecture for modularity and reusability
- Signal-based state management for reactivity
- Clean service layer for data fetching
- Type-safe interfaces for all models
- Responsive design with mobile-first approach

### The Premium Shopping Journey

**Discovery (Landing)** → **Browsing (Shop)** → **Selection (Product Detail)** → **Purchase (Cart/Checkout)**

Each step maintains:
- Same visual language
- Same emotional tone
- Same quality standards
- Same brand personality

### What Makes This System "Night Reader"

1. **Not Generic E-Commerce** - Every element is branded, from button styles to empty states
2. **Moody but Usable** - Dark aesthetic doesn't compromise readability or UX
3. **Intellectual but Accessible** - Premium feel without pretension
4. **Masculine but Inclusive** - Appeals to target audience without alienating others
5. **Disciplined but Beautiful** - Clean structure with aesthetic flourishes

### Success Metrics

A successful Night Reader shop achieves:
- **Visual Recognition:** User immediately knows they're still on Night Reader (brand consistency)
- **Ease of Use:** Filters, sorting, and navigation are intuitive
- **Conversion:** Strong CTAs and clear product information drive purchases
- **Brand Loyalty:** Experience is memorable and reinforces brand values
- **Mobile Performance:** Works beautifully on all devices

---

**Night Reader Shop: Where premium merch meets the examined life.**

**Built with discipline and intention. For those who read by moonlight and train by dawn.**

---

*End of Complete Product Route + Shop Design System*
