# Night Reader - Complete Member Account System Design

**A premium, moody authentication and account management experience for the examined life.**

---

## Table of Contents

1. [UX Vision](#1-ux-vision)
2. [User Flow Overview](#2-user-flow-overview)
3. [Pages to Design](#3-pages-to-design)
4. [Angular Component Architecture](#4-angular-component-architecture)
5. [Data Models & Interfaces](#5-data-models--interfaces)
6. [Visual Design Guidelines](#6-visual-design-guidelines)
7. [Security & Best Practices](#7-security--best-practices)
8. [Checkout Integration](#8-checkout-integration)
9. [Future-Proof Expansions](#9-future-proof-expansions)
10. [Final Summary](#10-final-summary)

---

## 1. UX Vision

### Emotional Tone

The Night Reader login experience should feel like **stepping into a private reading chamber** — a quiet, candlelit sanctuary where only serious readers are welcomed. It's not a transaction; it's an **invitation to join a community of the examined life**.

**Core Feelings:**
- **Intimate** - Like entering a secret library after hours
- **Premium** - High-quality, exclusive, trustworthy
- **Contemplative** - Calm, thoughtful, never rushed
- **Welcoming** - Warm despite the darkness
- **Cultured** - Intellectual, refined, deliberate

### Aesthetic Language

**"The Nightstand Library" Metaphor:**

Imagine logging in feels like:
1. **Approaching** - Walking through moonlit corridors
2. **Entering** - Opening heavy oak doors with brass handles
3. **Arriving** - Settling into a leather chair by candlelight
4. **Belonging** - Your name embossed in gold on the member register

**Visual Anchors:**
- **Candlelight glows** - Soft gold radial gradients behind form fields
- **Parchment textures** - Subtle noise/grain on backgrounds
- **Leather-bound book aesthetic** - Rich, tactile visual language
- **Moon phases** - Progress indicators, status icons
- **Wax seal accents** - Verification badges, trust indicators
- **Ink & quill motifs** - Form inputs feel like signing a manuscript

### Brand Differentiation

Unlike typical e-commerce logins (bright, utilitarian, rushed), Night Reader's system is:
- **Dark & moody** instead of white & clinical
- **Serif-heavy** instead of all sans-serif
- **Slow & intentional** instead of aggressive CTAs
- **Literary references** instead of generic copy
- **Members** not "users" or "customers"

---

## 2. User Flow Overview

### Complete Journey Map

```
ENTRY POINTS:
┌─────────────────────────────────────────────────────────────┐
│ 1. Header "Account" link (all pages)                        │
│ 2. "Add to Cart" when logged out (optional login prompt)    │
│ 3. Checkout page (login or continue as guest)               │
│ 4. "Save for Later" on product page (requires login)        │
│ 5. Email link (password reset, order confirmation)          │
└─────────────────────────────────────────────────────────────┘
```

### Primary Flow: New Member

```
Landing Page
    ↓
Click "Account" or "Login"
    ↓
Login Page
    ├─→ [Have Account] Enter credentials → Dashboard
    └─→ [No Account] Click "Join the Library" → Signup Page
            ↓
        Fill form (name, email, password)
            ↓
        Submit → Email verification sent
            ↓
        Click email link → Email verified
            ↓
        Redirect to Dashboard with welcome message
            ↓
        "Welcome to the Library, [Name]"
```

### Primary Flow: Returning Member

```
Any Page
    ↓
Click "Account"
    ↓
Login Page
    ↓
Enter credentials
    ├─→ [Correct] → Dashboard
    ├─→ [Forgot Password] → Reset Flow
    │       ↓
    │   Enter email → Reset link sent
    │       ↓
    │   Click link → Set new password → Success → Login
    └─→ [Wrong Credentials] → Error message → Retry
```

### Checkout Integration Flow

```
Shopping Cart (with items)
    ↓
Click "Proceed to Checkout"
    ↓
Checkout Page
    ├─→ [Logged In] → Skip to shipping form (autofill saved address)
    └─→ [Not Logged In] → Two options:
            ├─→ "Login to your account"
            │       ↓
            │   Quick login modal → Dashboard → Back to checkout
            └─→ "Continue as guest"
                    ↓
                Fill shipping form → Complete order
                    ↓
                "Create account to save this order?" (optional)
```

### Dashboard Navigation Flow

```
Account Dashboard
    ├─→ Purchase History
    │       ↓
    │   View all orders
    │       ↓
    │   Click order → Order Detail Page
    │       ├─→ View items
    │       ├─→ Download invoice PDF
    │       ├─→ Track shipment
    │       └─→ Re-buy items
    │
    ├─→ Saved Items / Wishlist
    │       ↓
    │   Grid of saved products
    │       ├─→ Remove from wishlist
    │       └─→ Move to cart
    │
    ├─→ Address Book
    │       ↓
    │   List of saved addresses
    │       ├─→ Edit address
    │       ├─→ Delete address
    │       ├─→ Set default
    │       └─→ Add new address
    │
    ├─→ Account Settings
    │       ↓
    │   Manage profile
    │       ├─→ Change password
    │       ├─→ Update email
    │       ├─→ Notification preferences
    │       └─→ Delete account
    │
    └─→ Logout
            ↓
        Confirm logout → Redirect to homepage
```

### Page Hierarchy

```
/account
    /login                    (LoginPageComponent)
    /signup                   (SignupPageComponent)
    /forgot-password          (ForgotPasswordComponent)
    /reset-password/:token    (ResetPasswordComponent)
    /verify-email/:token      (EmailVerificationComponent)

/dashboard                    (AccountDashboardComponent)
    /orders                   (OrderHistoryComponent)
    /orders/:id               (OrderDetailComponent)
    /wishlist                 (SavedItemsComponent)
    /addresses                (AddressBookComponent)
    /settings                 (AccountSettingsComponent)
```

---

## 3. Pages to Design

### A) Login Page (`/account/login`)

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────┐
│                  🌙                                      │
│           NIGHT READER                                   │
│      Where Books Meet Iron                              │
│                                                          │
│     ─────────────────────────────────                   │
│                                                          │
│         "Enter the Library"                             │
│                                                          │
│     ┌─────────────────────────────────┐                │
│     │ Email Address                   │                │
│     │ [your@email.com           ]    │                │
│     └─────────────────────────────────┘                │
│                                                          │
│     ┌─────────────────────────────────┐                │
│     │ Password                        │                │
│     │ [••••••••••••             ]    │                │
│     └─────────────────────────────────┘                │
│                                                          │
│     ☐ Remember me                                       │
│                                                          │
│     [        LOGIN TO ACCOUNT        ]                  │
│                                                          │
│     Forgot password?                                    │
│                                                          │
│     ─────────────────────────────────                   │
│                                                          │
│     Not a member?                                       │
│     Join the Library                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**

**Header:**
- Logo: Night Reader with moon icon (🌙)
- Tagline: "Where Books Meet Iron"
- Font: Cinzel for logo, Cormorant Garamond italic for tagline

**Page Title:**
- "Enter the Library" or "Welcome Back, Night Reader"
- Font: Cinzel, 32px, Parchment color
- Centered

**Form Fields:**
- Background: Slate Charcoal with subtle glow
- Border: 1px Steel Grey, changes to Candlelight Gold on focus
- Padding: 16px
- Font: Inter, 16px
- Placeholder text: Moonstone color
- Input text: Parchment color

**"Remember Me" Checkbox:**
- Custom styled checkbox (gold checkmark)
- Label: Inter, 14px, Steel Grey

**Login Button:**
- Full width
- Background: Candlelight Gold
- Text: Espresso Black, uppercase, bold
- Hover: Ancient Gold with gold glow shadow
- Height: 48px

**"Forgot Password" Link:**
- Centered below button
- Font: Inter, 14px
- Color: Steel Grey
- Hover: Candlelight Gold, underline

**Divider:**
- 1px line, Storm Grey
- "OR" centered on line

**"Join the Library" Link:**
- Font: Cormorant Garamond, 18px, italic
- Color: Candlelight Gold
- Hover: Ancient Gold, underline

**Background:**
- Dark gradient: Obsidian → Midnight Blue → Moonlit Blue
- Radial glow behind form (subtle purple)
- Noise texture overlay (5% opacity)

**Error States:**
- Red border on input (Wax Seal Red)
- Error message below input: "Invalid credentials"
- Font: Inter, 12px, Wax Seal Red

---

### B) Create Account Page (`/account/signup`)

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────┐
│                  🌙                                      │
│           NIGHT READER                                   │
│                                                          │
│      "Join the Library of Night Readers"                │
│                                                          │
│     ┌──────────────┐  ┌──────────────┐                 │
│     │ First Name   │  │ Last Name    │                 │
│     │ [          ] │  │ [          ] │                 │
│     └──────────────┘  └──────────────┘                 │
│                                                          │
│     ┌─────────────────────────────────┐                │
│     │ Email Address (required)        │                │
│     │ [your@email.com           ]    │                │
│     └─────────────────────────────────┘                │
│                                                          │
│     ┌─────────────────────────────────┐                │
│     │ Password (required)             │                │
│     │ [••••••••••••             ]    │                │
│     │ ● At least 8 characters         │                │
│     │ ● One uppercase letter          │                │
│     │ ● One number or symbol          │                │
│     └─────────────────────────────────┘                │
│                                                          │
│     ┌─────────────────────────────────┐                │
│     │ Confirm Password (required)     │                │
│     │ [••••••••••••             ]    │                │
│     └─────────────────────────────────┘                │
│                                                          │
│     ┌─────────────────────────────────┐                │
│     │ Phone (optional)                │                │
│     │ [                         ]    │                │
│     └─────────────────────────────────┘                │
│                                                          │
│     ☐ Subscribe to Night Reader updates                │
│                                                          │
│     [     CREATE MY ACCOUNT     ]                       │
│                                                          │
│     Already a member? Login                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**

**Page Title:**
- "Join the Library of Night Readers"
- Font: Cinzel, 28px, Parchment

**Form Layout:**
- 2-column for first/last name on desktop
- Single column on mobile
- Gap: 16px

**Password Requirements:**
- Live validation indicators
- Green checkmark (✓) when met
- Grey when not met
- Font: Inter, 12px

**Subscribe Checkbox:**
- "Receive curated recommendations and member-only offers"
- Font: Inter, 14px, Steel Grey

**Create Account Button:**
- Same styling as Login button
- Text: "CREATE MY ACCOUNT"

**Success State:**
- Show success message: "Welcome to the Library! 🌙"
- "We've sent a verification link to [email]"
- "Check your inbox to activate your account"
- Auto-redirect in 5 seconds or manual "Go to Dashboard" link

**Validation:**
- Real-time validation on blur
- Red border + error message for invalid fields
- Green border for valid fields
- Email format validation
- Password strength indicator (weak/medium/strong)

---

### C) Account Dashboard (`/dashboard`)

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│  NIGHT READER                                    🌙  John Doe ▾  │
│  Home  Shop  Account                                    Logout   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────┐  ┌──────────────────────────────────────┐  │
│  │               │  │                                       │  │
│  │  ACCOUNT      │  │  Welcome back, Night Reader.          │  │
│  │  MENU         │  │                                       │  │
│  │               │  │  ┌─────────────────────────────┐      │  │
│  │  Dashboard    │  │  │ John Doe                     │      │  │
│  │  Orders (3)   │  │  │ john@nightreader.com         │      │  │
│  │  Wishlist (5) │  │  │ Member since Jan 2025        │      │  │
│  │  Addresses    │  │  │ Reader Level: Initiate       │      │  │
│  │  Settings     │  │  └─────────────────────────────┘      │  │
│  │               │  │                                       │  │
│  │  Logout       │  │  QUICK ACTIONS                        │  │
│  │               │  │                                       │  │
│  └───────────────┘  │  ┌──────────┐  ┌──────────┐          │  │
│                      │  │ 📦       │  │ ❤️        │          │  │
│                      │  │ View     │  │ Saved    │          │  │
│                      │  │ Orders   │  │ Items    │          │  │
│                      │  │ 3 total  │  │ 5 items  │          │  │
│                      │  └──────────┘  └──────────┘          │  │
│                      │                                       │  │
│                      │  ┌──────────┐  ┌──────────┐          │  │
│                      │  │ 📍       │  │ ⚙️        │          │  │
│                      │  │ Manage   │  │ Account  │          │  │
│                      │  │ Addresses│  │ Settings │          │  │
│                      │  │ 2 saved  │  │          │          │  │
│                      │  └──────────┘  └──────────┘          │  │
│                      │                                       │  │
│                      │  RECENT ACTIVITY                      │  │
│                      │  Order #NR-2834 shipped               │  │
│                      │  Added 2 items to wishlist            │  │
│                      │                                       │  │
│                      └──────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

**Layout:**
- 2-column: Sidebar (250px) + Main content (flex)
- Single column on mobile (sidebar becomes top nav)

**Greeting:**
- "Welcome back, Night Reader." or personalized "Welcome back, [FirstName]."
- Font: Cormorant Garamond, italic, 24px, Parchment

**Profile Card:**
- Background: Slate Charcoal
- Border: 1px Candlelight Gold
- Padding: 24px
- Display: Name, email, join date, member level
- Avatar placeholder: Circle with initials

**Reader Level System (Optional):**
- **Initiate**: 0-2 orders
- **Scholar**: 3-9 orders
- **Sage**: 10+ orders
- Display as badge with moon phase icon

**Quick Action Cards:**
- 2×2 grid
- Each card: Icon, title, count/description
- Background: Shadow color
- Border: Steel Grey
- Hover: Lift effect, gold border
- Size: 150×150px

**Recent Activity:**
- List of last 5 actions
- Font: Inter, 14px, Moonstone
- Icons for each action type
- Timestamps in relative time ("2 days ago")

**Sidebar Menu:**
- Active state: Candlelight Gold background, Espresso text
- Inactive: Steel Grey text
- Hover: Moonstone color
- Badge counts in parentheses

---

### D) Purchase History (`/dashboard/orders`)

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar │  YOUR ORDERS                                         │
│          │  "A record of your examined purchases"                │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐  │
│          │  │ Order #NR-2834          Jan 15, 2025          │  │
│          │  │ ────────────────────────────────────────────  │  │
│          │  │ [img] Read by Moonlight Sticker    $4.99     │  │
│          │  │ [img] Night Reader Hoodie          $49.99    │  │
│          │  │                                               │  │
│          │  │ Status: Shipped                               │  │
│          │  │ Total: $54.98                                 │  │
│          │  │                                               │  │
│          │  │ [Track Order] [View Invoice] [Re-buy Items]  │  │
│          │  └───────────────────────────────────────────────┘  │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐  │
│          │  │ Order #NR-2719          Dec 28, 2024          │  │
│          │  │ ────────────────────────────────────────────  │  │
│          │  │ [img] Discipline & Iron T-Shirt    $24.99    │  │
│          │  │                                               │  │
│          │  │ Status: Delivered                             │  │
│          │  │ Total: $24.99                                 │  │
│          │  │                                               │  │
│          │  │ [View Invoice] [Re-buy This] [Leave Review]  │  │
│          │  └───────────────────────────────────────────────┘  │
│          │                                                       │
│          │  [Load More Orders]                                  │
│          │                                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

**Page Title:**
- "Your Orders"
- Subtitle: "A record of your examined purchases"
- Font: Cinzel (title), Cormorant Garamond italic (subtitle)

**Order Card:**
- Background: Slate Charcoal
- Border: 1px Steel Grey
- Padding: 24px
- Border-radius: 12px
- Hover: Lift effect

**Order Header:**
- Order number (bold, Parchment)
- Date (Steel Grey, right-aligned)
- Divider line (1px, Storm Grey)

**Order Items:**
- Product thumbnail (80×80px)
- Product name + price
- Quantity if > 1

**Status Badge:**
- Pending: Steel Grey
- Processing: Moonlit Blue
- Shipped: Candlelight Gold
- Delivered: Green
- Cancelled: Wax Seal Red

**Action Buttons:**
- Ghost buttons (border only)
- Hover: Fill with Candlelight Gold

**Pagination:**
- "Load More Orders" button
- Or traditional pagination if preferred
- Shows 10 orders per page

---

### E) Wishlist / Saved Items (`/dashboard/wishlist`)

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar │  YOUR SAVED ITEMS                                    │
│          │  "Curated for future nights"                         │
│          │                                                       │
│          │  5 items saved                    [Clear All]        │
│          │                                                       │
│          │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│          │  │  [img]  │  │  [img]  │  │  [img]  │             │
│          │  │         │  │         │  │         │             │
│          │  │  ❤️ ✕   │  │  ❤️ ✕   │  │  ❤️ ✕   │             │
│          │  │         │  │         │  │         │             │
│          │  │ Product │  │ Product │  │ Product │             │
│          │  │ Title   │  │ Title   │  │ Title   │             │
│          │  │         │  │         │  │         │             │
│          │  │ $24.99  │  │ $14.99  │  │ $9.99   │             │
│          │  │         │  │         │  │         │             │
│          │  │ [Move   │  │ [Move   │  │ [Move   │             │
│          │  │  to     │  │  to     │  │  to     │             │
│          │  │  Cart]  │  │  Cart]  │  │  Cart]  │             │
│          │  └─────────┘  └─────────┘  └─────────┘             │
│          │                                                       │
│          │  [Add All to Cart]                                   │
│          │                                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

**Page Title:**
- "Your Saved Items"
- Subtitle: "Curated for future nights"

**Header Actions:**
- Item count display
- "Clear All" button (danger style, confirmation required)

**Product Grid:**
- 3 columns on desktop
- 2 columns on tablet
- 1 column on mobile
- Gap: 24px

**Wishlist Card:**
- Product image (300×300px)
- Filled heart icon (Wax Seal Red) + Remove X
- Product title
- Collection name (italic)
- Price
- "Move to Cart" button (primary style)

**Remove Icon:**
- Positioned top-right on image
- X in circle
- Hover: Scale + red glow

**Empty State:**
- Moon icon
- "Your wishlist is empty"
- "Explore the collection to save items for later"
- CTA: "Browse Products"

**Bulk Actions:**
- "Add All to Cart" button at bottom
- Adds all items and redirects to cart

---

### F) Address Book (`/dashboard/addresses`)

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar │  YOUR ADDRESSES                                      │
│          │  "Destinations for your examined life"               │
│          │                                                       │
│          │  [+ Add New Address]                                 │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐  │
│          │  │ 🏠 Home Address (Default)                     │  │
│          │  │                                                │  │
│          │  │ John Doe                                       │  │
│          │  │ 123 Reading Lane                               │  │
│          │  │ Apt 4B                                         │  │
│          │  │ New York, NY 10001                            │  │
│          │  │ United States                                  │  │
│          │  │ +1 (555) 123-4567                             │  │
│          │  │                                                │  │
│          │  │ [Edit] [Delete] [Set as Default]              │  │
│          │  └───────────────────────────────────────────────┘  │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐  │
│          │  │ 🏢 Work Address                               │  │
│          │  │                                                │  │
│          │  │ John Doe                                       │  │
│          │  │ 456 Office Plaza                               │  │
│          │  │ Suite 200                                      │  │
│          │  │ Brooklyn, NY 11201                            │  │
│          │  │ United States                                  │  │
│          │  │ +1 (555) 987-6543                             │  │
│          │  │                                                │  │
│          │  │ [Edit] [Delete] [Set as Default]              │  │
│          │  └───────────────────────────────────────────────┘  │
│          │                                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

**Page Title:**
- "Your Addresses"
- Subtitle: "Destinations for your examined life"

**Add New Button:**
- Primary button style
- Opens modal or slides in form
- Icon: + plus sign

**Address Card:**
- Background: Slate Charcoal
- Border: 1px Steel Grey
- Default address: Gold border
- Padding: 24px
- Border-radius: 12px

**Address Type Icon:**
- 🏠 Home
- 🏢 Work
- 📦 Other
- Gold color

**Default Badge:**
- "(Default)" text in Candlelight Gold
- Or gold star icon

**Actions:**
- Edit: Opens edit modal
- Delete: Confirmation dialog, can't delete default
- Set as Default: Only shown on non-default addresses

**Add/Edit Address Form (Modal):**
```
┌─────────────────────────────────┐
│  Add New Address                │
│                                 │
│  Label (Home, Work, Other)      │
│  [               ]              │
│                                 │
│  First Name         Last Name   │
│  [         ]        [         ] │
│                                 │
│  Address Line 1                 │
│  [                         ]    │
│                                 │
│  Address Line 2 (optional)      │
│  [                         ]    │
│                                 │
│  City           State    Zip    │
│  [         ]    [    ]   [    ] │
│                                 │
│  Country                        │
│  [United States        ▾]       │
│                                 │
│  Phone                          │
│  [                         ]    │
│                                 │
│  ☐ Set as default address       │
│                                 │
│  [Cancel]  [Save Address]       │
│                                 │
└─────────────────────────────────┘
```

---

### G) Settings Page (`/dashboard/settings`)

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar │  ACCOUNT SETTINGS                                    │
│          │  "Manage your Night Reader account"                  │
│          │                                                       │
│          │  ═══════════════════════════════════════            │
│          │  PROFILE INFORMATION                                 │
│          │  ═══════════════════════════════════════            │
│          │                                                       │
│          │  First Name                 Last Name                │
│          │  [John            ]         [Doe             ]       │
│          │                                                       │
│          │  Email Address                                       │
│          │  [john@nightreader.com                    ]          │
│          │                                                       │
│          │  Phone (optional)                                    │
│          │  [+1 (555) 123-4567                       ]          │
│          │                                                       │
│          │  [Save Changes]                                      │
│          │                                                       │
│          │  ═══════════════════════════════════════            │
│          │  CHANGE PASSWORD                                     │
│          │  ═══════════════════════════════════════            │
│          │                                                       │
│          │  Current Password                                    │
│          │  [••••••••••••                            ]          │
│          │                                                       │
│          │  New Password                                        │
│          │  [••••••••••••                            ]          │
│          │                                                       │
│          │  Confirm New Password                                │
│          │  [••••••••••••                            ]          │
│          │                                                       │
│          │  [Update Password]                                   │
│          │                                                       │
│          │  ═══════════════════════════════════════            │
│          │  NOTIFICATIONS                                       │
│          │  ═══════════════════════════════════════            │
│          │                                                       │
│          │  ☑ Order updates                                     │
│          │  ☑ Shipping notifications                            │
│          │  ☑ New product launches                              │
│          │  ☐ Marketing emails                                  │
│          │  ☐ Member-only offers                                │
│          │                                                       │
│          │  [Save Preferences]                                  │
│          │                                                       │
│          │  ═══════════════════════════════════════            │
│          │  DANGER ZONE                                         │
│          │  ═══════════════════════════════════════            │
│          │                                                       │
│          │  Delete Account                                      │
│          │  This action is permanent and cannot be undone.      │
│          │                                                       │
│          │  [Delete My Account]                                 │
│          │                                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

**Section Dividers:**
- Double line: `═══════════════`
- Section title: Cinzel, 18px, uppercase, Parchment
- Spacing: 48px vertical margin

**Form Sections:**
- Grouped by functionality
- Clear visual separation
- Each has own "Save" button

**Profile Section:**
- Editable fields for name, email, phone
- "Save Changes" button (primary style)
- Success message on save

**Change Password Section:**
- Current password validation
- New password strength indicator
- Confirmation match validation
- "Update Password" button

**Notifications Section:**
- Custom checkboxes (Night Reader style)
- Grouped by category
- "Save Preferences" button

**Danger Zone:**
- Red border around section
- Warning text in Wax Seal Red
- "Delete My Account" button (danger style - red)
- Clicking opens confirmation modal:

```
┌─────────────────────────────────────────┐
│  Delete Your Account?                    │
│                                          │
│  This will permanently delete:           │
│  • Your profile and settings             │
│  • Order history                         │
│  • Saved items and addresses             │
│                                          │
│  Your past orders cannot be retrieved.   │
│                                          │
│  Type "DELETE" to confirm:               │
│  [                              ]        │
│                                          │
│  [Cancel]  [Permanently Delete Account]  │
│                                          │
└─────────────────────────────────────────┘
```

---

## 4. Angular Component Architecture

### Component Tree

```
App
├── Header (with Account dropdown)
├── Router Outlet
│   ├── LoginPageComponent
│   ├── SignupPageComponent
│   ├── ForgotPasswordComponent
│   ├── ResetPasswordComponent
│   ├── EmailVerificationComponent
│   └── AccountLayout
│       ├── AccountSidebarComponent
│       └── Router Outlet
│           ├── AccountDashboardComponent
│           ├── OrderHistoryComponent
│           ├── OrderDetailComponent
│           ├── SavedItemsComponent
│           ├── AddressBookComponent
│           └── AccountSettingsComponent
└── Footer
```

### Component Details

#### **LoginPageComponent** (`login-page.ts`)

```typescript
@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPageComponent {
  authService = inject(AuthService);
  router = inject(Router);

  loginForm = signal<FormGroup>(this.createLoginForm());
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  createLoginForm(): FormGroup {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      rememberMe: new FormControl(false)
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm().invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, rememberMe } = this.loginForm().value;

    try {
      const response = await this.authService.login(email, password, rememberMe);

      if (response.success) {
        // Redirect to dashboard or return URL
        const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Invalid credentials');
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

---

#### **SignupPageComponent** (`signup-page.ts`)

```typescript
@Component({
  selector: 'app-signup-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.css',
})
export class SignupPageComponent {
  authService = inject(AuthService);
  router = inject(Router);

  signupForm = signal<FormGroup>(this.createSignupForm());
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showSuccess = signal<boolean>(false);

  passwordStrength = computed<'weak' | 'medium' | 'strong'>(() => {
    const password = this.signupForm().get('password')?.value || '';
    return this.calculatePasswordStrength(password);
  });

  createSignupForm(): FormGroup {
    return new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      phone: new FormControl(''),
      subscribe: new FormControl(true)
    }, { validators: this.passwordMatchValidator });
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const valid = hasUpperCase && hasNumber;
    return valid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm().invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formData = this.signupForm().value;

    try {
      const response = await this.authService.signup(formData);

      if (response.success) {
        this.showSuccess.set(true);
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 5000);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Registration failed');
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

---

#### **AccountDashboardComponent** (`account-dashboard.ts`)

```typescript
@Component({
  selector: 'app-account-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './account-dashboard.html',
  styleUrl: './account-dashboard.css',
})
export class AccountDashboardComponent implements OnInit {
  userService = inject(UserService);
  orderService = inject(OrderService);
  wishlistService = inject(WishlistService);

  user = signal<User | null>(null);
  recentOrders = signal<Order[]>([]);
  wishlistCount = computed(() => this.wishlistService.items().length);
  orderCount = computed(() => this.user()?.orderCount || 0);
  addressCount = computed(() => this.user()?.addresses?.length || 0);

  readerLevel = computed<string>(() => {
    const count = this.orderCount();
    if (count >= 10) return 'Sage';
    if (count >= 3) return 'Scholar';
    return 'Initiate';
  });

  recentActivity = signal<ActivityItem[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadUserData();
    await this.loadRecentOrders();
    await this.loadRecentActivity();
  }

  async loadUserData(): Promise<void> {
    const user = await this.userService.getCurrentUser();
    this.user.set(user);
  }

  async loadRecentOrders(): Promise<void> {
    const orders = await this.orderService.getOrders({ limit: 3 });
    this.recentOrders.set(orders);
  }

  async loadRecentActivity(): Promise<void> {
    const activity = await this.userService.getRecentActivity();
    this.recentActivity.set(activity);
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}
```

---

#### **OrderHistoryComponent** (`order-history.ts`)

```typescript
@Component({
  selector: 'app-order-history',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistoryComponent implements OnInit {
  orderService = inject(OrderService);
  cartService = inject(CartService);

  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  async ngOnInit(): Promise<void> {
    await this.loadOrders();
  }

  async loadOrders(page: number = 1): Promise<void> {
    this.isLoading.set(true);

    const result = await this.orderService.getOrders({
      page,
      limit: 10,
      sort: '-createdAt'
    });

    this.orders.set(result.orders);
    this.currentPage.set(result.page);
    this.totalPages.set(result.totalPages);
    this.isLoading.set(false);
  }

  async rebuyOrder(order: Order): Promise<void> {
    for (const item of order.items) {
      await this.cartService.addToCart(item.product, item.variant, item.quantity);
    }

    // Show success message
    alert('Items added to cart!');
  }

  getStatusClass(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusMap[status];
  }

  downloadInvoice(orderId: string): void {
    this.orderService.downloadInvoice(orderId);
  }
}
```

---

#### **SavedItemsComponent** (`saved-items.ts`)

```typescript
@Component({
  selector: 'app-saved-items',
  imports: [CommonModule, RouterLink],
  templateUrl: './saved-items.html',
  styleUrl: './saved-items.css',
})
export class SavedItemsComponent {
  wishlistService = inject(WishlistService);
  cartService = inject(CartService);

  items = computed(() => this.wishlistService.items());

  async removeFromWishlist(productId: string): Promise<void> {
    await this.wishlistService.removeItem(productId);
  }

  async moveToCart(item: WishlistItem): Promise<void> {
    await this.cartService.addToCart(item.product);
    await this.wishlistService.removeItem(item.productId);
  }

  async addAllToCart(): Promise<void> {
    for (const item of this.items()) {
      await this.cartService.addToCart(item.product);
    }
    await this.wishlistService.clearAll();
  }

  async clearAll(): Promise<void> {
    if (confirm('Remove all items from your wishlist?')) {
      await this.wishlistService.clearAll();
    }
  }
}
```

---

#### **AddressBookComponent** (`address-book.ts`)

```typescript
@Component({
  selector: 'app-address-book',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-book.html',
  styleUrl: './address-book.css',
})
export class AddressBookComponent {
  addressService = inject(AddressService);

  addresses = computed(() => this.addressService.addresses());
  showAddModal = signal<boolean>(false);
  editingAddress = signal<Address | null>(null);
  addressForm = signal<FormGroup>(this.createAddressForm());

  createAddressForm(): FormGroup {
    return new FormGroup({
      label: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      addressLine1: new FormControl('', [Validators.required]),
      addressLine2: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required]),
      country: new FormControl('United States', [Validators.required]),
      phone: new FormControl('', [Validators.required]),
      isDefault: new FormControl(false)
    });
  }

  openAddModal(): void {
    this.editingAddress.set(null);
    this.addressForm().reset({ country: 'United States' });
    this.showAddModal.set(true);
  }

  openEditModal(address: Address): void {
    this.editingAddress.set(address);
    this.addressForm().patchValue(address);
    this.showAddModal.set(true);
  }

  async saveAddress(): Promise<void> {
    if (this.addressForm().invalid) return;

    const formData = this.addressForm().value;
    const editing = this.editingAddress();

    if (editing) {
      await this.addressService.updateAddress(editing.id, formData);
    } else {
      await this.addressService.addAddress(formData);
    }

    this.showAddModal.set(false);
  }

  async deleteAddress(id: string): Promise<void> {
    if (confirm('Delete this address?')) {
      await this.addressService.deleteAddress(id);
    }
  }

  async setDefault(id: string): Promise<void> {
    await this.addressService.setDefaultAddress(id);
  }
}
```

---

#### **AccountSettingsComponent** (`account-settings.ts`)

```typescript
@Component({
  selector: 'app-account-settings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css',
})
export class AccountSettingsComponent implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthService);

  profileForm = signal<FormGroup>(this.createProfileForm());
  passwordForm = signal<FormGroup>(this.createPasswordForm());
  notificationForm = signal<FormGroup>(this.createNotificationForm());

  user = signal<User | null>(null);

  async ngOnInit(): Promise<void> {
    const user = await this.userService.getCurrentUser();
    this.user.set(user);
    this.profileForm().patchValue(user);
    this.notificationForm().patchValue(user.preferences);
  }

  createProfileForm(): FormGroup {
    return new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('')
    });
  }

  createPasswordForm(): FormGroup {
    return new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  createNotificationForm(): FormGroup {
    return new FormGroup({
      orderUpdates: new FormControl(true),
      shippingNotifications: new FormControl(true),
      newProducts: new FormControl(true),
      marketing: new FormControl(false),
      memberOffers: new FormControl(false)
    });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm().invalid) return;

    const formData = this.profileForm().value;
    await this.userService.updateProfile(formData);
    alert('Profile updated successfully!');
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm().invalid) return;

    const { currentPassword, newPassword } = this.passwordForm().value;
    await this.authService.changePassword(currentPassword, newPassword);

    this.passwordForm().reset();
    alert('Password updated successfully!');
  }

  async saveNotifications(): Promise<void> {
    const preferences = this.notificationForm().value;
    await this.userService.updatePreferences(preferences);
    alert('Notification preferences saved!');
  }

  async deleteAccount(): Promise<void> {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');

    if (confirmation === 'DELETE') {
      await this.authService.deleteAccount();
      this.authService.logout();
      alert('Your account has been deleted.');
    }
  }
}
```

---

#### **AccountSidebarComponent** (`account-sidebar.ts`)

```typescript
@Component({
  selector: 'app-account-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './account-sidebar.html',
  styleUrl: './account-sidebar.css',
})
export class AccountSidebarComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  wishlistService = inject(WishlistService);

  user = computed(() => this.userService.currentUser());
  wishlistCount = computed(() => this.wishlistService.items().length);
  orderCount = computed(() => this.user()?.orderCount || 0);

  menuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: '🏠' },
    { label: 'Orders', route: '/dashboard/orders', icon: '📦', badge: () => this.orderCount() },
    { label: 'Wishlist', route: '/dashboard/wishlist', icon: '❤️', badge: () => this.wishlistCount() },
    { label: 'Addresses', route: '/dashboard/addresses', icon: '📍' },
    { label: 'Settings', route: '/dashboard/settings', icon: '⚙️' }
  ];

  logout(): void {
    if (confirm('Log out of your account?')) {
      this.authService.logout();
    }
  }
}
```

---

### Service Architecture

#### **AuthService** (`auth.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'nightreader_token';
  private readonly REFRESH_TOKEN_KEY = 'nightreader_refresh_token';

  http = inject(HttpClient);
  router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.loadUserFromToken();
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password })
    );

    this.handleAuthResponse(response, rememberMe);
    return response;
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.API_URL}/signup`, userData)
    );

    this.handleAuthResponse(response);
    return response;
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean }>(`${this.API_URL}/forgot-password`, { email })
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean }>(`${this.API_URL}/reset-password`, { token, newPassword })
    );
  }

  async verifyEmail(token: string): Promise<{ success: boolean }> {
    return await firstValueFrom(
      this.http.post<{ success: boolean }>(`${this.API_URL}/verify-email`, { token })
    );
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.API_URL}/change-password`, { currentPassword, newPassword })
    );
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
      );

      this.setToken(response.token);
      if (response.refreshToken) {
        this.setRefreshToken(response.refreshToken);
      }

      return response.token;
    } catch {
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  async deleteAccount(): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.API_URL}/account`)
    );
    this.logout();
  }

  // Private helpers

  private handleAuthResponse(response: AuthResponse, rememberMe: boolean = false): void {
    this.setToken(response.token, rememberMe);

    if (response.refreshToken) {
      this.setRefreshToken(response.refreshToken, rememberMe);
    }

    this.currentUser.set(response.user);
  }

  private setToken(token: string, persist: boolean = false): void {
    if (persist) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  private setRefreshToken(token: string, persist: boolean = false): void {
    if (persist) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = this.decodeToken(token);

      // Check if token is expired
      if (payload.exp * 1000 < Date.now()) {
        this.refreshToken();
      } else {
        this.currentUser.set(payload.user);
      }
    } catch {
      this.clearTokens();
    }
  }

  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }
}
```

---

#### **UserService** (`user.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = '/api/user';

  http = inject(HttpClient);

  currentUser = signal<User | null>(null);

  async getCurrentUser(): Promise<User> {
    const user = await firstValueFrom(
      this.http.get<User>(`${this.API_URL}/me`)
    );
    this.currentUser.set(user);
    return user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const user = await firstValueFrom(
      this.http.patch<User>(`${this.API_URL}/profile`, data)
    );
    this.currentUser.set(user);
    return user;
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<User> {
    const user = await firstValueFrom(
      this.http.patch<User>(`${this.API_URL}/preferences`, { preferences })
    );
    this.currentUser.set(user);
    return user;
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    return await firstValueFrom(
      this.http.get<ActivityItem[]>(`${this.API_URL}/activity`)
    );
  }
}
```

---

#### **OrderService** (`order.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API_URL = '/api/orders';

  http = inject(HttpClient);

  async getOrders(params: OrderQueryParams): Promise<OrderListResponse> {
    return await firstValueFrom(
      this.http.get<OrderListResponse>(`${this.API_URL}`, { params: params as any })
    );
  }

  async getOrder(id: string): Promise<Order> {
    return await firstValueFrom(
      this.http.get<Order>(`${this.API_URL}/${id}`)
    );
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    return await firstValueFrom(
      this.http.post<Order>(`${this.API_URL}`, orderData)
    );
  }

  downloadInvoice(orderId: string): void {
    window.open(`${this.API_URL}/${orderId}/invoice`, '_blank');
  }

  async trackOrder(orderId: string): Promise<TrackingInfo> {
    return await firstValueFrom(
      this.http.get<TrackingInfo>(`${this.API_URL}/${orderId}/tracking`)
    );
  }
}
```

---

#### **WishlistService** (`wishlist.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly API_URL = '/api/wishlist';
  private readonly STORAGE_KEY = 'nightreader_wishlist';

  http = inject(HttpClient);
  authService = inject(AuthService);

  items = signal<WishlistItem[]>([]);

  constructor() {
    this.loadWishlist();

    // Sync with server when user logs in
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.syncWithServer();
      }
    });
  }

  async addItem(product: Product): Promise<void> {
    const item: WishlistItem = {
      id: this.generateId(),
      productId: product.id,
      product,
      addedAt: new Date()
    };

    this.items.update(items => [...items, item]);
    await this.saveWishlist();
  }

  async removeItem(productId: string): Promise<void> {
    this.items.update(items => items.filter(item => item.productId !== productId));
    await this.saveWishlist();
  }

  async clearAll(): Promise<void> {
    this.items.set([]);
    await this.saveWishlist();
  }

  isInWishlist(productId: string): boolean {
    return this.items().some(item => item.productId === productId);
  }

  private async saveWishlist(): Promise<void> {
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));

    // Sync to server if authenticated
    if (this.authService.isAuthenticated()) {
      await this.syncWithServer();
    }
  }

  private loadWishlist(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.items.set(JSON.parse(stored));
    }
  }

  private async syncWithServer(): Promise<void> {
    try {
      const serverItems = await firstValueFrom(
        this.http.get<WishlistItem[]>(`${this.API_URL}`)
      );

      // Merge local and server items (server takes precedence)
      this.items.set(serverItems);

      // Save merged items to server
      await firstValueFrom(
        this.http.put(`${this.API_URL}`, { items: this.items() })
      );
    } catch (error) {
      console.error('Failed to sync wishlist:', error);
    }
  }

  private generateId(): string {
    return `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

#### **AddressService** (`address.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly API_URL = '/api/addresses';

  http = inject(HttpClient);

  addresses = signal<Address[]>([]);
  defaultAddress = computed(() =>
    this.addresses().find(addr => addr.isDefault) || this.addresses()[0]
  );

  async loadAddresses(): Promise<void> {
    const addresses = await firstValueFrom(
      this.http.get<Address[]>(`${this.API_URL}`)
    );
    this.addresses.set(addresses);
  }

  async addAddress(data: Omit<Address, 'id'>): Promise<Address> {
    const address = await firstValueFrom(
      this.http.post<Address>(`${this.API_URL}`, data)
    );
    this.addresses.update(addrs => [...addrs, address]);
    return address;
  }

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const address = await firstValueFrom(
      this.http.patch<Address>(`${this.API_URL}/${id}`, data)
    );
    this.addresses.update(addrs =>
      addrs.map(addr => addr.id === id ? address : addr)
    );
    return address;
  }

  async deleteAddress(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.API_URL}/${id}`)
    );
    this.addresses.update(addrs => addrs.filter(addr => addr.id !== id));
  }

  async setDefaultAddress(id: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.API_URL}/${id}/default`, {})
    );
    this.addresses.update(addrs =>
      addrs.map(addr => ({ ...addr, isDefault: addr.id === id }))
    );
  }
}
```

---

### Guards & Interceptors

#### **AuthGuard** (`auth.guard.ts`)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  return router.createUrlTree(['/account/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

---

#### **TokenInterceptor** (`token.interceptor.ts`)

```typescript
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get token from auth service
  const token = authService.getToken();

  if (token) {
    // Clone request and add authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized, try to refresh token
      if (error.status === 401) {
        return from(authService.refreshToken()).pipe(
          switchMap(newToken => {
            if (newToken) {
              // Retry request with new token
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(req);
            } else {
              // Refresh failed, logout
              authService.logout();
              return throwError(() => error);
            }
          })
        );
      }

      return throwError(() => error);
    })
  );
};
```

---

### Routing Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: Products },
  { path: 'cart', component: Cart },

  // Public auth routes
  { path: 'account/login', component: LoginPageComponent },
  { path: 'account/signup', component: SignupPageComponent },
  { path: 'account/forgot-password', component: ForgotPasswordComponent },
  { path: 'account/reset-password/:token', component: ResetPasswordComponent },
  { path: 'account/verify-email/:token', component: EmailVerificationComponent },

  // Protected dashboard routes
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: AccountLayoutComponent,
    children: [
      { path: '', component: AccountDashboardComponent },
      { path: 'orders', component: OrderHistoryComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
      { path: 'wishlist', component: SavedItemsComponent },
      { path: 'addresses', component: AddressBookComponent },
      { path: 'settings', component: AccountSettingsComponent }
    ]
  }
];
```

---

## 5. Data Models & Interfaces

### User & Authentication

```typescript
// user.model.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  preferences: NotificationPreferences;
  readerLevel: ReaderLevel;
  orderCount: number;
  totalSpent: number;
  joinedAt: Date;
  emailVerified: boolean;
  lastLoginAt: Date;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  subscribe?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  shippingNotifications: boolean;
  newProducts: boolean;
  marketing: boolean;
  memberOffers: boolean;
}

export enum ReaderLevel {
  INITIATE = 'initiate',      // 0-2 orders
  SCHOLAR = 'scholar',         // 3-9 orders
  SAGE = 'sage'                // 10+ orders
}
```

---

### Orders

```typescript
// order.model.ts

export interface Order {
  id: string;
  orderNumber: string;           // e.g., "NR-2834"
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;              // Price at time of purchase
  subtotal: number;           // price × quantity
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sort?: string;              // e.g., '-createdAt'
}

export interface OrderListResponse {
  orders: Order[];
  page: number;
  totalPages: number;
  totalOrders: number;
}

export interface CreateOrderData {
  cartItems: CartItem[];
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethodId: string;
}

export interface TrackingInfo {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: Date;
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  timestamp: Date;
  status: string;
  location: string;
  message: string;
}
```

---

### Wishlist

```typescript
// wishlist.model.ts

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: Date;
}

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
  updatedAt: Date;
}
```

---

### Address

```typescript
// address.model.ts

export interface Address {
  id: string;
  label: string;              // "Home", "Work", "Other"
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Activity

```typescript
// activity.model.ts

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum ActivityType {
  ORDER_PLACED = 'order_placed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  WISHLIST_ADDED = 'wishlist_added',
  ADDRESS_ADDED = 'address_added',
  PASSWORD_CHANGED = 'password_changed'
}
```

---

### Purchase Summary

```typescript
// purchase-summary.model.ts

export interface PurchaseSummary {
  userId: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategory: ProductCategory;
  favoriteCollection: ProductCollection;
  readerLevel: ReaderLevel;
  memberSince: Date;
  lastPurchaseAt: Date;
}
```

---

## 6. Visual Design Guidelines

### Night Reader Account System Aesthetic

The account system must seamlessly integrate with the existing Night Reader brand identity while feeling like a **private members' sanctuary**.

---

### Color Palette Application

**Primary Colors:**
- **Backgrounds:** Obsidian (#0B0C10), Midnight Blue (#0A1628), Slate Charcoal (#2C3540)
- **Text:** Parchment (#E8DCC4), Moonstone (#D4D8DD), Steel Grey (#6B7C8C)
- **Accents:** Candlelight Gold (#D4A574), Ancient Gold (#C4925B)
- **Alerts:** Wax Seal Red (#8B2635) for errors/danger

**Component-Specific Colors:**

**Login/Signup Forms:**
- Background: Gradient from Obsidian to Midnight Blue
- Form container: Slate Charcoal
- Input fields: Shadow (#1C1E26) with Steel Grey border
- Focus state: Candlelight Gold border with subtle gold glow
- Error state: Wax Seal Red border

**Dashboard:**
- Page background: Midnight Blue
- Content cards: Slate Charcoal with Steel Grey borders
- Sidebar: Shadow color
- Active menu item: Candlelight Gold background with Espresso text
- Hover states: Moonstone text

**Buttons:**
- Primary (Login, Save): Candlelight Gold background, Espresso Black text
- Secondary (Cancel): Transparent with Steel Grey border
- Danger (Delete): Wax Seal Red background, white text
- Ghost: Transparent with Moonstone text, underline on hover

---

### Typography System

**Font Pairings:**

**Headers & Titles:**
- Font: Cinzel (serif, elegant, literary)
- Weights: Regular (400), Bold (700), Black (900)
- Use for: Page titles, section headers, logo, form labels
- Transform: Uppercase for emphasis
- Letter-spacing: 0.05em - 0.1em

**Body Text & UI:**
- Font: Inter (sans-serif, clean, readable)
- Weights: Light (300), Regular (400), Medium (500), Semibold (600), Bold (700)
- Use for: Form inputs, buttons, body text, navigation, labels
- Transform: Sentence case or uppercase for buttons

**Accents & Quotes:**
- Font: Cormorant Garamond (serif, italic, literary)
- Weights: Light (300), Regular (400), Medium (500), Semibold (600)
- Style: Italic
- Use for: Taglines, quotes, subtitles, empty state messages

**Type Scale:**

```css
--h1: clamp(2.5rem, 5vw, 3.5rem);     /* 40-56px - Page titles */
--h2: clamp(2rem, 4vw, 3rem);         /* 32-48px - Section titles */
--h3: clamp(1.5rem, 3vw, 2rem);       /* 24-32px - Subsections */
--h4: clamp(1.25rem, 2.5vw, 1.5rem);  /* 20-24px - Card titles */
--h5: 1.125rem;                        /* 18px - Small headers */

--body-large: 1.125rem;                /* 18px */
--body: 1rem;                          /* 16px */
--body-small: 0.875rem;                /* 14px */
--caption: 0.75rem;                    /* 12px */
```

**Line Heights:**
- Headers: 1.2 - 1.3
- Body: 1.6
- Captions: 1.4

---

### Spacing & Layout

**Spacing Scale:**

```css
--spacing-2xs: 0.25rem;    /* 4px */
--spacing-xs: 0.5rem;      /* 8px */
--spacing-sm: 0.75rem;     /* 12px */
--spacing-md: 1rem;        /* 16px */
--spacing-lg: 1.5rem;      /* 24px */
--spacing-xl: 2rem;        /* 32px */
--spacing-2xl: 3rem;       /* 48px */
--spacing-3xl: 4rem;       /* 64px */
```

**Component Spacing:**

**Form Fields:**
- Padding: 16px (var(--spacing-md))
- Margin bottom: 24px (var(--spacing-lg))
- Gap between inline fields: 16px

**Cards:**
- Padding: 24px (var(--spacing-lg)) on desktop
- Padding: 16px (var(--spacing-md)) on mobile
- Gap between cards: 24px

**Page Layout:**
- Max-width: 1200px (centered)
- Horizontal padding: 40px desktop, 16px mobile
- Vertical padding: 80px desktop, 40px mobile

**Sidebar:**
- Width: 250px on desktop
- Padding: 24px
- Becomes top nav on mobile (full width)

---

### Shadows & Effects

**Box Shadows:**

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.25);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.35);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.45);

--glow-gold: 0 0 20px rgba(212, 165, 116, 0.4);
--glow-blue: 0 0 20px rgba(136, 192, 208, 0.3);
```

**Application:**
- Login/signup forms: shadow-xl
- Dashboard cards: shadow-md
- Hover effects: shadow-lg + lift (-4px)
- Buttons on hover: glow-gold

**Radial Glows (Backgrounds):**

```css
background: radial-gradient(
  circle at 50% 0%,
  rgba(136, 192, 208, 0.15) 0%,
  transparent 50%
);
```

Use behind forms, headers, and important sections for depth.

---

### Border Radius

```css
--radius-sm: 4px;      /* Input fields, tags */
--radius-md: 8px;      /* Buttons, small cards */
--radius-lg: 12px;     /* Large cards, modals */
--radius-xl: 16px;     /* Page sections */
--radius-full: 9999px; /* Badges, pills */
```

---

### Transitions & Animations

**Standard Transitions:**

```css
--transition-fast: 0.15s ease-out;
--transition-normal: 0.3s ease-out;
--transition-slow: 0.5s ease-out;
```

**Hover Effects:**
- Links: color change (0.15s)
- Buttons: background + shadow + lift (0.3s)
- Cards: lift + border color (0.3s)
- Inputs: border color + glow (0.15s)

**Page Transitions:**
- Fade in: opacity 0 → 1 (0.3s)
- Slide in: translateY(20px) → 0 (0.4s)

**Micro-interactions:**
- Checkbox check: scale 0.8 → 1.1 → 1 (0.2s)
- Badge pop: scale 1 → 1.3 → 1 (0.3s)
- Button click: scale 0.95 → 1 (0.1s)

---

### Imagery & Textures

**Background Textures:**
- Subtle noise overlay (5% opacity) on all backgrounds
- Parchment texture on form containers (3% opacity)
- Leather texture on sidebar (optional, very subtle)

**Icons:**
- Use simple, line-based icons
- Color: Moonstone default, Candlelight Gold on hover
- Size: 20-24px for UI icons

**Moon Phases (Progress/Status):**
- New Moon: Pending/empty
- Crescent: In progress
- Half Moon: Halfway
- Gibbous: Nearly complete
- Full Moon: Complete/delivered

**Decorative Elements:**
- Wax seal for verification badges
- Quill icon for editing
- Book spine dividers between sections
- Candlestick for headers (optional)

---

### Focus States (Accessibility)

**Keyboard Navigation:**

```css
*:focus-visible {
  outline: 2px solid var(--candlelight-gold);
  outline-offset: 4px;
}

button:focus-visible,
a:focus-visible {
  box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.3);
}
```

**Skip Links:**
- "Skip to main content" link for screen readers
- Visually hidden until focused

---

### Responsive Breakpoints

```css
/* Mobile first approach */

/* Small mobile: default (< 480px) */

/* Mobile: 480px+ */
@media (min-width: 480px) { }

/* Tablet: 768px+ */
@media (min-width: 768px) { }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { }

/* Large desktop: 1200px+ */
@media (min-width: 1200px) { }
```

**Layout Changes:**
- Sidebar: Side nav (desktop) → Top nav (mobile)
- Forms: 2-column (desktop) → 1-column (mobile)
- Cards: 3-4 column grid → 2 column → 1 column
- Spacing: Reduce by 25-50% on mobile

---

### Button Hierarchy Visual Reference

**Primary Button (Login, Save, Create Account):**
```css
.btn-primary {
  background: var(--candlelight-gold);
  color: var(--espresso-black);
  border: none;
  padding: 1rem 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.btn-primary:hover {
  background: var(--ancient-gold);
  box-shadow: var(--glow-gold);
  transform: translateY(-2px);
}
```

**Secondary Button (Cancel, Back):**
```css
.btn-secondary {
  background: transparent;
  color: var(--steel-grey);
  border: 2px solid var(--steel-grey);
  padding: 1rem 2rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.btn-secondary:hover {
  border-color: var(--candlelight-gold);
  color: var(--candlelight-gold);
}
```

**Danger Button (Delete Account):**
```css
.btn-danger {
  background: var(--wax-seal-red);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.btn-danger:hover {
  background: #A02D42;
  box-shadow: 0 0 20px rgba(139, 38, 53, 0.5);
}
```

**Ghost Button (Links that look like buttons):**
```css
.btn-ghost {
  background: transparent;
  color: var(--moonstone);
  border: none;
  padding: 0.5rem 1rem;
  font-weight: 500;
  text-decoration: underline;
  transition: color var(--transition-fast);
}

.btn-ghost:hover {
  color: var(--candlelight-gold);
}
```

---

### Custom Form Elements

**Checkbox (Night Reader style):**

```css
.custom-checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid var(--steel-grey);
  border-radius: var(--radius-sm);
  background: var(--shadow);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.custom-checkbox:checked {
  background: var(--candlelight-gold);
  border-color: var(--candlelight-gold);
}

.custom-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--espresso-black);
  font-weight: bold;
  font-size: 14px;
}

.custom-checkbox:focus-visible {
  outline: 2px solid var(--candlelight-gold);
  outline-offset: 2px;
}
```

**Input Field (Night Reader style):**

```css
.form-input {
  width: 100%;
  padding: 1rem;
  background: var(--shadow);
  border: 1px solid var(--steel-grey);
  border-radius: var(--radius-md);
  color: var(--parchment);
  font-family: var(--font-body);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input::placeholder {
  color: var(--moonstone);
  opacity: 0.6;
}

.form-input:focus {
  outline: none;
  border-color: var(--candlelight-gold);
  box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
}

.form-input.error {
  border-color: var(--wax-seal-red);
}
```

---

## 7. Security & Best Practices

### JWT Authentication Strategy

**Token Structure:**

```
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_123",
    "email": "john@nightreader.com",
    "role": "member",
    "exp": 1704153600,      // Expiry (15 minutes for access token)
    "iat": 1704153000       // Issued at
  },
  "signature": "..."
}
```

**Two-Token System:**

1. **Access Token (Short-lived)**
   - Lifetime: 15 minutes
   - Stored in: sessionStorage (default) or localStorage (if "Remember Me")
   - Used for: All authenticated API requests
   - Sent via: Authorization header (`Bearer <token>`)

2. **Refresh Token (Long-lived)**
   - Lifetime: 7 days (or 30 days with "Remember Me")
   - Stored in: httpOnly secure cookie (preferred) or localStorage
   - Used for: Obtaining new access tokens
   - Endpoint: `POST /api/auth/refresh`

**Token Flow:**

```
1. User logs in
   ↓
2. Server validates credentials
   ↓
3. Server generates access token (15min) + refresh token (7 days)
   ↓
4. Client stores both tokens
   ↓
5. Client makes API requests with access token
   ↓
6. Access token expires (after 15min)
   ↓
7. Client gets 401 Unauthorized
   ↓
8. Client automatically calls /refresh with refresh token
   ↓
9. Server validates refresh token, issues new access token
   ↓
10. Client retries original request with new access token
```

**Token Refresh Logic (Client-side):**

Handled by TokenInterceptor (see Section 4) - automatically refreshes on 401.

---

### Password Security

**Hashing Algorithm:**
- **bcrypt** (recommended) with cost factor 12-14
- Or **argon2** (more secure, slower)

**Server-side (Node.js example):**

```javascript
const bcrypt = require('bcrypt');

// Hash password on signup
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password on login
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
```

**Password Requirements (Client-side validation):**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number or special character
- Optional: Check against common password list (e.g., "password123")

---

### Rate Limiting

**Login Endpoint Protection:**

```javascript
// Express.js with express-rate-limit
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 attempts
  message: 'Too many login attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  // Login logic
});
```

**Account Creation Limiter:**
- 3 signups per IP per hour
- Prevents spam account creation

**Password Reset Limiter:**
- 3 reset requests per email per hour
- Prevents email bombing

---

### CSRF Protection

**For Same-Origin Deployments:**

Use CSRF tokens for state-changing requests:

```javascript
const csrf = require('csurf');

// CSRF middleware
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Send CSRF token to client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Client includes token in requests
// Angular: HttpClient automatically includes XSRF token
```

**For Cross-Origin (API-only):**
- CSRF less critical if using JWT in Authorization header
- Still validate origin headers
- Use CORS whitelist

---

### Secure Storage: Cookies vs localStorage

**Comparison:**

| Aspect | httpOnly Secure Cookie | localStorage |
|--------|------------------------|--------------|
| **XSS Protection** | ✅ Immune (not accessible via JS) | ❌ Vulnerable |
| **CSRF Protection** | ❌ Needs CSRF tokens | ✅ Immune |
| **Cross-domain** | ⚠️ Complex (SameSite) | ✅ Easy |
| **Size Limit** | 4KB | 5-10MB |
| **Recommended for** | Refresh tokens | Access tokens (with caution) |

**Night Reader Strategy:**

1. **Access Token:**
   - sessionStorage (default logout on tab close)
   - localStorage (if "Remember Me" checked)
   - Acceptable risk since short-lived (15min)

2. **Refresh Token:**
   - **Preferred:** httpOnly secure cookie with SameSite=Strict
   - **Fallback:** localStorage (if cross-domain required)

**Cookie Configuration (Server):**

```javascript
res.cookie('refreshToken', token, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

---

### Email Verification Flow

**Process:**

```
1. User signs up
   ↓
2. Server creates user account (emailVerified: false)
   ↓
3. Server generates verification token (JWT, expires in 24h)
   ↓
4. Server sends email with verification link:
   https://nightreader.com/account/verify-email?token=<token>
   ↓
5. User clicks link
   ↓
6. Client sends token to server: POST /api/auth/verify-email
   ↓
7. Server validates token, marks emailVerified: true
   ↓
8. Client shows success message, redirects to dashboard
```

**Verification Token:**

```javascript
// Generate token
const verificationToken = jwt.sign(
  { userId: user.id, type: 'email_verification' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Send email
await sendEmail({
  to: user.email,
  subject: 'Welcome to Night Reader - Verify Your Email',
  html: `
    <h1>Welcome, ${user.firstName}!</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${process.env.FRONTEND_URL}/account/verify-email?token=${verificationToken}">
      Verify Email
    </a>
    <p>This link expires in 24 hours.</p>
  `
});
```

**Email Template (Night Reader Style):**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #0A1628;
      color: #E8DCC4;
      padding: 40px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #2C3540;
      padding: 40px;
      border-radius: 12px;
      border: 1px solid #D4A574;
    }
    h1 {
      font-family: 'Cinzel', serif;
      color: #D4A574;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background: #D4A574;
      color: #0B0C10;
      padding: 16px 32px;
      text-decoration: none;
      font-weight: bold;
      text-transform: uppercase;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌙 Welcome to Night Reader</h1>
    <p>Greetings, ${firstName},</p>
    <p>You've joined the library of examined lives. Verify your email to unlock your account:</p>
    <center>
      <a href="${verificationLink}" class="btn">Verify Email Address</a>
    </center>
    <p style="color: #6B7C8C; font-size: 14px;">
      This link expires in 24 hours. If you didn't create this account, please ignore this email.
    </p>
    <hr style="border-color: #6B7C8C;">
    <p style="text-align: center; color: #6B7C8C;">
      <em>"In the quiet hours, we become."</em><br>
      — Night Reader
    </p>
  </div>
</body>
</html>
```

---

### Password Reset Flow

**Process:**

```
1. User clicks "Forgot Password"
   ↓
2. User enters email address
   ↓
3. Server generates reset token (JWT, expires in 1h)
   ↓
4. Server sends email with reset link:
   https://nightreader.com/account/reset-password?token=<token>
   ↓
5. User clicks link
   ↓
6. Client shows "Set New Password" form
   ↓
7. User enters new password
   ↓
8. Client sends: POST /api/auth/reset-password { token, newPassword }
   ↓
9. Server validates token, hashes password, updates user
   ↓
10. Server invalidates all existing refresh tokens (logout all devices)
   ↓
11. Client shows success, redirects to login
```

**Security Considerations:**
- **Don't reveal** if email exists in system (always show "If email exists, reset link sent")
- **Rate limit** reset requests (3 per email per hour)
- **Single-use tokens** (mark as used after reset)
- **Short expiry** (1 hour max)
- **Invalidate all sessions** on password change

---

### Additional Security Measures

**1. Account Lockout:**
```javascript
// After 5 failed login attempts
if (user.failedLoginAttempts >= 5) {
  user.lockedUntil = Date.now() + (30 * 60 * 1000); // 30 minutes
  return res.status(423).json({ error: 'Account locked. Try again in 30 minutes.' });
}
```

**2. Session Management:**
- Track all active sessions per user
- Allow users to view and revoke sessions
- Auto-expire old sessions

**3. IP Whitelisting (Optional):**
- For high-value accounts
- Notify on login from new IP

**4. Two-Factor Authentication (Future):**
- TOTP (Google Authenticator)
- SMS verification
- Email verification code

**5. Audit Logging:**
- Log all auth events: login, logout, password change, email change
- Store IP, user agent, timestamp
- Display in account activity feed

---

## 8. Checkout Integration

### Login During Checkout

**User Flow:**

```
Shopping Cart (with items)
    ↓
Click "Proceed to Checkout"
    ↓
Checkout Page
    ├─→ [Logged In]
    │     ↓
    │   Shipping form (autofilled with default address)
    │     ↓
    │   Payment form
    │     ↓
    │   Review order
    │     ↓
    │   Place order
    │
    └─→ [Not Logged In]
          ↓
        Two options displayed:
          ├─→ "Login to your account"
          │     ↓
          │   Login modal/form
          │     ↓
          │   On success: Redirect back to checkout (shipping form autofilled)
          │
          └─→ "Continue as guest"
                ↓
              Fill shipping form manually
                ↓
              Payment form
                ↓
              Review order
                ↓
              Place order
                ↓
              "Create account to save this order?" (optional prompt)
```

---

### Checkout Page Layout (Not Logged In)

```
┌─────────────────────────────────────────────────────────────┐
│  CHECKOUT                                                    │
│  "Complete your order"                                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ALREADY A MEMBER?                                    │  │
│  │                                                        │  │
│  │  Email: [                                    ]        │  │
│  │  Password: [••••••••••                       ]        │  │
│  │                                                        │  │
│  │  [Login to Autofill]                                  │  │
│  │                                                        │  │
│  │  Benefits: Faster checkout, order history, rewards   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ────── OR CONTINUE AS GUEST ──────                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SHIPPING INFORMATION                                 │  │
│  │                                                        │  │
│  │  [Fill shipping form...]                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Quick Login Component (Inline):**

```typescript
@Component({
  selector: 'app-checkout-login',
  template: `
    <div class="checkout-login">
      <h3>Already a Member?</h3>
      <p class="login-benefits">Login for faster checkout, order history, and member rewards.</p>

      <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
        <input formControlName="email" placeholder="Email" type="email" />
        <input formControlName="password" placeholder="Password" type="password" />

        <button type="submit" class="btn-primary">Login to Autofill</button>
      </form>

      <a routerLink="/account/forgot-password">Forgot password?</a>
    </div>
  `
})
export class CheckoutLoginComponent {
  // Login logic that autofills checkout form on success
}
```

---

### Guest Checkout

**Process:**

```
1. User clicks "Continue as Guest"
   ↓
2. User fills shipping form manually
   ↓
3. User completes payment
   ↓
4. Order created with guestEmail (not linked to account)
   ↓
5. Order confirmation sent to guest email
   ↓
6. [OPTIONAL] Post-order prompt:
   "Create account to save this order?"
   ├─→ Yes: Signup form → Account created → Order linked
   └─→ No: Order remains guest order
```

**Guest Order Model:**

```typescript
interface GuestOrder extends Order {
  guestEmail: string;
  guestName: string;
  isGuest: true;
  convertedToUserId?: string;  // If guest later creates account
}
```

**Post-Checkout Account Creation:**

```
┌─────────────────────────────────────────────────┐
│  Order Placed Successfully! 🌙                  │
│                                                 │
│  Order #NR-2945                                 │
│  Confirmation sent to guest@email.com           │
│                                                 │
│  ───────────────────────────────────────        │
│                                                 │
│  Save this order to your account?               │
│                                                 │
│  Create a Night Reader account to:              │
│  • Track this order                             │
│  • View order history                           │
│  • Faster checkout next time                    │
│  • Member-only offers                           │
│                                                 │
│  [Create My Account]  [No Thanks, Continue]     │
│                                                 │
└─────────────────────────────────────────────────┘
```

If user creates account, `POST /api/auth/signup-from-order`:
- Creates user account
- Links guest order to new user ID
- Sends welcome email

---

### Saving Cart to User Account

**Cart Sync Strategy:**

**1. Anonymous Cart (localStorage):**
```typescript
// Before login
cartService.cartItems() → Stored in localStorage only
```

**2. On Login:**
```typescript
async function onLoginSuccess(user: User): Promise<void> {
  // Get local cart
  const localCart = cartService.cartItems();

  // Fetch server cart
  const serverCart = await http.get('/api/cart').toPromise();

  // Merge: Local cart takes precedence for conflicts
  const mergedCart = mergeCartItems(localCart, serverCart.items);

  // Update server
  await http.put('/api/cart', { items: mergedCart }).toPromise();

  // Update local
  cartService.cartItems.set(mergedCart);
}
```

**3. While Logged In:**
```typescript
// Every cart change syncs to server
effect(() => {
  const items = cartService.cartItems();
  if (authService.isAuthenticated()) {
    syncCartToServer(items);
  }
});
```

**4. On Logout:**
```typescript
// Cart remains in localStorage
// Server cart saved for next login
```

---

### Exposing Order Details in Purchase History

**Order Detail Page:**

After purchase, order appears in `/dashboard/orders`:

```typescript
// Order created during checkout
const order: Order = {
  id: 'order_123',
  orderNumber: 'NR-2945',
  userId: user.id,              // Or null for guest
  items: cartItems,
  subtotal: 49.99,
  shipping: 0,                  // Free over $50
  tax: 4.00,
  total: 53.99,
  status: OrderStatus.PROCESSING,
  shippingAddress: checkoutData.shippingAddress,
  billingAddress: checkoutData.billingAddress,
  createdAt: new Date(),
  // ... tracking info added later
};
```

**API Endpoint:**

```
GET /api/orders/:id
Authorization: Bearer <token>

Response:
{
  "order": {
    "id": "order_123",
    "orderNumber": "NR-2945",
    "items": [...],
    "status": "shipped",
    "trackingNumber": "1Z999AA1234567890",
    "trackingUrl": "https://track.ups.com/...",
    "estimatedDelivery": "2025-01-20",
    // ... full order details
  }
}
```

User can:
- View order items
- Download invoice PDF
- Track shipment
- Re-buy items
- Contact support

---

## 9. Future-Proof Expansions

### Loyalty System: "Reader Levels"

**Concept:** Gamify repeat purchases with tiered membership levels based on order count and spending.

**Tiers:**

```typescript
enum ReaderLevel {
  INITIATE = 'initiate',      // 0-2 orders, $0-$99 spent
  SCHOLAR = 'scholar',         // 3-9 orders, $100-$499 spent
  SAGE = 'sage',               // 10+ orders, $500+ spent
  LUMINARY = 'luminary'        // 25+ orders, $1000+ spent (future)
}
```

**Benefits:**

| Level | Icon | Perks |
|-------|------|-------|
| **Initiate** | 🌑 New Moon | • Welcome discount<br>• Email updates |
| **Scholar** | 🌓 Crescent | • Free shipping on all orders<br>• Early access to new products<br>• 5% discount on orders |
| **Sage** | 🌕 Full Moon | • All Scholar perks<br>• 10% discount on orders<br>• Exclusive products<br>• Birthday gift |
| **Luminary** | ✨ Supermoon | • All Sage perks<br>• 15% discount<br>• Personal recommendations<br>• VIP support |

**Display:**

Dashboard shows:
- Current level with icon
- Progress to next level (e.g., "2 more orders to reach Scholar")
- Total orders and spending
- Perks unlocked

**Implementation:**

```typescript
function calculateReaderLevel(user: User): ReaderLevel {
  const { orderCount, totalSpent } = user;

  if (orderCount >= 25 || totalSpent >= 1000) return ReaderLevel.LUMINARY;
  if (orderCount >= 10 || totalSpent >= 500) return ReaderLevel.SAGE;
  if (orderCount >= 3 || totalSpent >= 100) return ReaderLevel.SCHOLAR;
  return ReaderLevel.INITIATE;
}
```

---

### Subscription Boxes: "Nightstand Crates"

**Concept:** Monthly curated box of exclusive Night Reader items.

**Plans:**

1. **Moonlight Monthly** ($29.99/month)
   - 2-3 exclusive stickers
   - 1 small item (bookmark, pin, patch)
   - Member-only discount code

2. **Scholar's Collection** ($59.99/month)
   - All Moonlight items
   - 1 apparel item (t-shirt, hoodie rotation)
   - Limited edition print/poster
   - Free shipping

3. **Sage's Library** ($99.99/month)
   - All Scholar items
   - Premium apparel
   - Signed art print
   - Exclusive digital content (e-book, wallpapers)
   - Priority customer support

**Dashboard Integration:**

```
/dashboard/subscription
  - Current plan
  - Next box ships: [date]
  - Box history
  - Pause subscription
  - Change plan
  - Cancel subscription
```

**Recurring Billing:**
- Charge monthly via Stripe subscriptions
- Send notification 3 days before renewal
- Allow pause/cancel anytime

---

### Digital Library Perks

**Concept:** Unlock digital content with purchases or membership.

**Digital Perks:**

1. **Night Reader Wallpapers**
   - Desktop & mobile wallpapers
   - Unlock with any purchase
   - New designs monthly

2. **E-Books & Reading Guides**
   - "The Night Reader's Manifesto" (free PDF)
   - Curated reading lists by genre
   - Available to all members

3. **Exclusive Podcast/Audio Content**
   - "Moonlit Conversations" - interviews with authors
   - Available to Scholar+ members

4. **Custom Playlist Access**
   - Spotify playlists for reading
   - "Night Reader's Study Sessions"
   - "Dark Academia Ambiance"

**Dashboard Section:**

```
/dashboard/library
  - Wallpapers (grid)
  - E-Books (list with download buttons)
  - Audio Content (embedded player)
  - Playlists (links to Spotify)
```

---

### Exclusive Members-Only Products

**Concept:** Limited edition items only available to logged-in members.

**Examples:**
- "Sage Exclusive" hoodie (only Sage+ can purchase)
- Limited run art prints (100 made, members only)
- Pre-order access to new collections
- Member-designed products (community voting)

**Product Badge:**
```html
<span class="badge-members-only">🔒 Members Only</span>
```

**Gating:**
```typescript
// Product model
interface Product {
  // ...
  membersOnly: boolean;
  requiredLevel?: ReaderLevel;  // Optional: require specific level
}

// Product page logic
if (product.membersOnly && !authService.isAuthenticated()) {
  // Show "Login to Purchase" instead of "Add to Cart"
}
```

---

### PDF Receipts Stored in Account

**Concept:** Auto-generate PDF invoices for all orders, stored in user account.

**Features:**
- Professional Night Reader branded invoice
- Download anytime from order history
- Includes order number, items, pricing, shipping address
- Tax breakdown

**Implementation:**

```typescript
// Generate PDF server-side
import PDFDocument from 'pdfkit';

async function generateInvoice(order: Order): Promise<Buffer> {
  const doc = new PDFDocument();

  // Add Night Reader logo
  doc.image('logo.png', 50, 50, { width: 100 });

  // Invoice header
  doc.fontSize(20).text('INVOICE', 400, 50);
  doc.fontSize(12).text(`Order #${order.orderNumber}`, 400, 80);
  doc.text(`Date: ${formatDate(order.createdAt)}`, 400, 100);

  // Customer info
  doc.fontSize(14).text('Bill To:', 50, 150);
  doc.fontSize(12).text(order.shippingAddress.firstName + ' ' + order.shippingAddress.lastName, 50, 170);
  // ... more address fields

  // Items table
  // ... render order items

  // Totals
  doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`, 400, 500);
  doc.text(`Shipping: $${order.shipping.toFixed(2)}`, 400, 520);
  doc.text(`Tax: $${order.tax.toFixed(2)}`, 400, 540);
  doc.fontSize(14).text(`Total: $${order.total.toFixed(2)}`, 400, 560);

  doc.end();
  return doc;
}
```

**Storage:**
- Upload PDF to cloud storage (S3, Cloudinary)
- Store URL in order record
- Serve via signed URL (expiring link for security)

**UI:**
```html
<button (click)="downloadInvoice(order.id)">
  📄 Download Invoice
</button>
```

---

### AI Recommendation Engine

**Concept:** Personalized product recommendations based on purchase history and browsing.

**Data Collected:**
- Products viewed
- Products purchased
- Time spent on categories
- Wishlist items
- Cart abandonment

**Recommendation Types:**

1. **"Recommended for You"** (Homepage)
   - Based on past purchases
   - "Customers who bought X also bought Y"

2. **"Complete the Collection"** (Product page)
   - Show matching items from same collection

3. **"You Might Like"** (Dashboard)
   - Personalized based on browsing history

**Simple Implementation (Rule-based):**

```typescript
function getRecommendations(user: User): Product[] {
  const purchasedProducts = user.orders.flatMap(o => o.items.map(i => i.product));
  const favoriteCategory = getMostPurchasedCategory(purchasedProducts);
  const favoriteCollection = getMostPurchasedCollection(purchasedProducts);

  // Find products in favorite category/collection that user hasn't bought
  return allProducts.filter(p =>
    (p.category === favoriteCategory || p.collection === favoriteCollection) &&
    !purchasedProducts.some(pp => pp.id === p.id)
  ).slice(0, 6);
}
```

**Future: ML-based:**
- Train model on user behavior
- Collaborative filtering
- Deep learning recommendations

---

### Referral Program

**Concept:** "Invite a friend, both get 15% off"

**Flow:**
1. User generates unique referral link: `nightreader.com?ref=JOHN123`
2. Friend signs up via link
3. Friend gets 15% off first order
4. User gets 15% off next order (or $10 credit)

**Dashboard:**
```
/dashboard/referrals
  - Your referral link
  - Friends referred: 3
  - Credits earned: $30
  - Pending credits: $10 (friend hasn't purchased yet)
```

---

### Gift Cards & Store Credit

**Concept:** Digital gift cards purchasable as products.

**Features:**
- Buy gift card ($25, $50, $100, custom)
- Recipient receives email with code
- Redeem at checkout
- Track balance in dashboard

**Dashboard:**
```
/dashboard/credits
  - Gift card balance: $50.00
  - Applied to cart: -$25.00
  - Remaining: $25.00
  - Redeem code: [        ] [Apply]
```

---

### Social Features (Optional)

**Concept:** Community aspects for engaged members.

**Features:**
1. **Public Profile** (opt-in)
   - Username, avatar, bio
   - Public wishlist
   - Favorite products

2. **Product Reviews**
   - Rate and review purchased items
   - Verified purchase badge
   - Photos

3. **Reading Lists**
   - Share curated lists of products
   - "My Dark Academia Essentials"
   - Other users can follow lists

---

## 10. Final Summary

### How This System Matches Night Reader Aesthetic

**Visual Cohesion:**
- **Dark, moody palette** throughout login, dashboard, and account pages
- **Serif headers (Cinzel)** for all titles maintain literary elegance
- **Candlelight gold accents** on CTAs, borders, and interactive elements
- **Moonlight iconography** (moon phases for progress, status indicators)
- **Parchment textures** and subtle noise overlays create tactile depth
- **Consistent spacing and shadows** match landing page and shop

**Emotional Consistency:**
- Login feels like **entering a private library**, not a transaction
- Dashboard greets users as **"Night Readers"**, part of a community
- Account pages use **contemplative messaging** ("examined life", "curated for future nights")
- No aggressive upsells or countdown timers - **calm, confident tone**
- Forms feel **intentional and thoughtful**, never rushed

**Brand Voice:**
- All copy reinforces **dark academia × discipline × introspection** themes
- Empty states use poetic language ("Your cart is empty... for now")
- Error messages are calm and helpful, not alarming
- Success messages celebrate milestones ("Welcome to the Library! 🌙")

---

### Customer Retention Benefits

**1. Friction Reduction:**
- **Autofill checkout** with saved addresses
- **Remember me** option for persistent login
- **Wishlist sync** across devices
- **Order history** for easy re-ordering

**2. Exclusive Value:**
- **Reader Levels** reward repeat purchases
- **Members-only products** create FOMO
- **Early access** to new collections
- **Digital perks** (wallpapers, e-books) add value beyond products

**3. Community Building:**
- **Member identity** ("Night Reader", not "customer")
- **Loyalty tiers** create aspirational goals
- **Referral program** incentivizes sharing
- **Exclusive content** (podcast, playlists) deepens engagement

**4. Personalization:**
- **Saved preferences** (notification settings, default address)
- **Order history** shows past purchases
- **Recommendations** tailored to taste
- **Subscription boxes** curated for individual

---

### Repeat Purchase Drivers

**Ease of Re-buying:**
- **"Re-buy This Order"** button on past orders (one-click repurchase)
- **Wishlist reminders** (email when saved item goes on sale)
- **Low stock alerts** for favorited products
- **Subscription boxes** create recurring revenue

**Incentives:**
- **Reader Level discounts** (5-15% based on tier)
- **Free shipping** for Scholar+ members
- **Birthday gifts** for Sage+ members
- **Loyalty credits** for referrals and reviews

**Engagement Loops:**
- **Email campaigns** for new products (opt-in)
- **Member-only sales** (flash sales for logged-in users)
- **Product reviews** encourage return visits
- **Digital content updates** (new wallpapers monthly)

---

### Premium Brand Feel

**High-Quality Execution:**
- **Professional design** - no corners cut on UX
- **Smooth animations** - 60fps transitions, no jank
- **Attention to detail** - custom checkboxes, branded PDFs, curated copy
- **Security messaging** - "Secure Checkout" badge, HTTPS, trust signals
- **Email design** - Branded HTML emails, not plain text

**Exclusive Atmosphere:**
- **Private library metaphor** - login feels special, not mundane
- **Tiered access** - higher levels unlock more perks
- **Limited editions** - scarcity creates desire
- **Curated experience** - every element intentional

**Customer Service:**
- **VIP support** for Sage+ members
- **Detailed order tracking** with carrier updates
- **Easy returns** (30-day policy mentioned in footer)
- **Personal touches** (birthday gifts, handwritten notes with orders)

---

### Long-Term Brand Building

**Data Collection:**
- **User preferences** inform product development
- **Purchase patterns** guide inventory decisions
- **Wishlist data** reveals demand for new items
- **Reader Levels** identify VIP customers for exclusive previews

**Content Strategy:**
- **Digital library** keeps users engaged between purchases
- **Podcast/playlists** build lifestyle brand beyond merch
- **Email campaigns** nurture relationships over time
- **Social features** (reviews, lists) create user-generated content

**Scalability:**
- **JWT auth** supports millions of users
- **Subscription model** adds predictable revenue
- **API-first design** allows mobile app in future
- **Modular components** (Angular) easy to extend

**Brand Loyalty:**
- **Identity-driven** - users see themselves as "Night Readers"
- **Community** - shared values (discipline, reading, self-improvement)
- **Aspirational** - Reader Levels create progression
- **Consistent** - every touchpoint reinforces brand

---

### Implementation Priorities

**Phase 1: MVP (Launch)**
- ✅ Login/Signup pages
- ✅ Dashboard with profile
- ✅ Order history
- ✅ Saved addresses
- ✅ Account settings
- ✅ Password reset flow
- ✅ Email verification

**Phase 2: Engagement (Month 2)**
- ✅ Wishlist functionality
- ✅ Reader Levels (basic)
- ✅ Checkout integration
- ✅ Guest checkout
- ✅ PDF invoices

**Phase 3: Retention (Month 3-6)**
- ✅ Subscription boxes
- ✅ Digital library
- ✅ Referral program
- ✅ Product reviews
- ✅ Advanced recommendations

**Phase 4: Scale (6+ months)**
- ✅ Mobile app
- ✅ Social features
- ✅ Gift cards
- ✅ Loyalty enhancements (Luminary tier)
- ✅ AI recommendations

---

### Success Metrics

**Authentication:**
- Signup conversion rate > 25% (of visitors who add to cart)
- Email verification rate > 70%
- Login success rate > 95% (minimal friction)
- Password reset usage < 5% (users remember passwords)

**Engagement:**
- Repeat purchase rate > 40% within 90 days
- Average orders per user: 3+ per year
- Wishlist save rate: 15% of product views
- Dashboard visit frequency: 2+ times per month

**Retention:**
- Reader Level progression: 30% reach Scholar, 10% reach Sage
- Subscription retention: >80% after 3 months
- Referral participation: 20% of members refer friend
- NPS score: >60 (promoters)

**Revenue Impact:**
- Logged-in user AOV 35% higher than guest
- Subscription revenue: 20% of total sales
- Loyalty discount usage: 50% of orders (shows value)
- LTV: $300+ for Scholar, $800+ for Sage

---

## Conclusion

The Night Reader Member Account System transforms authentication from a necessary evil into a **premium experience** that deepens brand connection and drives long-term value.

By treating members as **Night Readers** - part of an exclusive community of examined lives - the system creates:

✅ **Emotional resonance** - Login feels special, not transactional
✅ **Friction reduction** - Saved data speeds up repeat purchases
✅ **Exclusive value** - Tiers, perks, and content reward loyalty
✅ **Scalable revenue** - Subscriptions, referrals, and repeat purchases
✅ **Brand differentiation** - Stands out in crowded merch market

**Every detail** - from Cinzel headers to candlelight glows to "Welcome back, Night Reader" greetings - reinforces the brand's **moody, premium, intentional** identity.

This isn't just a login system. It's an **invitation to belong**.

---

**"In the quiet hours, we become." 🌙**

*— Night Reader Account System Design, Complete*
