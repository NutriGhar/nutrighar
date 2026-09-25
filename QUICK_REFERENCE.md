# NutriGhar E-Commerce - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm run start
```

Visit: **http://localhost:3000**

---

## 📂 Key Files to Edit

### Product Catalog
**File**: `data/products.ts`
- Edit `PRODUCTS` array to add/remove/modify products
- Update `CATEGORIES` for category names
- Edit `FEATURES` for homepage features section

### Product Types
**File**: `types/product.ts`
- Contains TypeScript interfaces
- Edit `Product` interface to add new fields
- Edit `Order` interface for order data structure

### Styling
**File**: `app/globals.css`
- Global styles and Tailwind config
- Edit CSS variables for color changes

### Business Information
Edit these files to update business details:
- `components/Footer.tsx` - Contact info, links
- `app/contact/page.tsx` - Contact form, FAQ, WhatsApp link
- `app/about/page.tsx` - Company story, values
- `components/Navbar.tsx` - Logo/branding

---

## 🛍️ Product Catalog (Mock Data)

Located in `data/products.ts`:

```typescript
{
  id: 'besan-ladoo',
  name: 'Besan Ladoo',
  category: 'mithai',
  price: 299,
  image: 'https://images.unsplash.com/...',
  description: 'Traditional gram flour ladoos...',
  rating: 4.8,
  reviews: 128,
  ingredients: ['Gram flour', 'Ghee', ...],
  benefits: ['High in protein', ...],
}
```

### Categories Available
- `mithai` - Traditional sweets
- `peanut-butter` - Peanut butter products
- `protein-nutrition` - Protein & nutrition
- `healthy-snacks` - Healthy snacks

---

## 📱 Responsive Breakpoints

- **Mobile**: 0px - 639px
- **Tablet**: 640px - 1023px  
- **Desktop**: 1024px+

Use Tailwind's responsive prefixes:
- `sm:` (640px+)
- `md:` (768px+)
- `lg:` (1024px+)
- `xl:` (1280px+)

---

## 🎨 Color Palette

**Primary Colors**:
- Amber: `#D97706` (amber-600)
- Orange: `#F59E0B` (amber-400)
- Light Amber: `#FCD34D` (amber-300)

**Accent Colors**:
- Green (success): `#16A34A` (green-600)
- Red (error): `#DC2626` (red-600)

**Neutral Colors**:
- Gray: `#6B7280` (gray-500)
- Dark Gray: `#111827` (gray-900)
- Light Gray: `#F3F4F6` (gray-100)

---

## 🛒 Cart System

**Cart Calculation Logic** (in `app/cart/page.tsx`):

```typescript
const subtotal = getTotal();
const deliveryCharge = subtotal > 500 ? 0 : 60;
const total = subtotal + deliveryCharge;
```

**localStorage Key**: `cart`
**Order localStorage Key**: `lastOrder`

---

## 📋 File Structure for Easy Navigation

```
app/
├── page.tsx              ← Home page
├── products/
│   ├── page.tsx          ← Products listing
│   └── [id]/page.tsx     ← Individual product
├── cart/page.tsx         ← Shopping cart
├── checkout/page.tsx     ← Checkout form
├── order-success/page.tsx ← Order confirmation
├── about/page.tsx        ← About Us
└── contact/page.tsx      ← Contact page

components/
├── Navbar.tsx            ← Navigation bar
├── Footer.tsx            ← Footer
├── ProductCard.tsx       ← Product card
├── CategoryCard.tsx      ← Category card
├── ProductGrid.tsx       ← Grid layout
└── CartItem.tsx          ← Cart item

context/
└── CartContext.tsx       ← Cart state

data/
└── products.ts           ← Mock products

types/
└── product.ts            ← TypeScript types
```

---

## 🔧 Common Tasks

### Add a New Product

1. Open `data/products.ts`
2. Add new object to `PRODUCTS` array:
```typescript
{
  id: 'unique-id',
  name: 'Product Name',
  category: 'mithai',
  price: 299,
  image: 'https://images.unsplash.com/...',
  description: 'Description',
  rating: 4.8,
  reviews: 50,
  ingredients: ['Item 1', 'Item 2'],
  benefits: ['Benefit 1', 'Benefit 2'],
}
```

### Change Delivery Charge Logic

Edit in `app/cart/page.tsx` and `app/checkout/page.tsx`:
```typescript
// Change the threshold (currently 500)
const deliveryCharge = subtotal > 500 ? 0 : 60; // ← Edit here
```

### Update Contact Information

Files to edit:
- `components/Footer.tsx` - Add phone, email
- `app/contact/page.tsx` - Add contact details, FAQ
- `components/Navbar.tsx` - Logo/branding

### Change Logo/Brand Name

- `components/Navbar.tsx` - Line 15: Logo emoji and name
- `app/layout.tsx` - Line 18: Page title and metadata

---

## 🔐 TypeScript Tips

All interfaces are in `types/product.ts`:

```typescript
// Product interface
interface Product {
  id: string;
  name: string;
  category: 'mithai' | 'peanut-butter' | 'protein-nutrition' | 'healthy-snacks';
  price: number;
  // ... other fields
}

// CartItem extends Product
interface CartItem extends Product {
  quantity: number;
}

// Order interface
interface Order {
  orderNumber: string;
  date: string;
  items: OrderItem[];
  // ... other fields
}
```

---

## 🎯 Page Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `app/page.tsx` | Home page |
| `/products` | `app/products/page.tsx` | Product listing |
| `/products/[id]` | `app/products/[id]/page.tsx` | Product details |
| `/cart` | `app/cart/page.tsx` | Shopping cart |
| `/checkout` | `app/checkout/page.tsx` | Checkout form |
| `/order-success` | `app/order-success/page.tsx` | Order confirmation |
| `/about` | `app/about/page.tsx` | About Us |
| `/contact` | `app/contact/page.tsx` | Contact page |

---

## 💾 localStorage Keys

- **cart**: Stores cart items as JSON array
- **lastOrder**: Stores last completed order as JSON object

Example:
```javascript
// Cart structure
[
  {
    id: 'besan-ladoo',
    name: 'Besan Ladoo',
    quantity: 2,
    price: 299,
    // ... other product fields
  }
]

// Order structure
{
  orderNumber: 'NG123456',
  date: '2024-08-30',
  items: [ { id, name, price, quantity } ],
  total: 1200,
  // ... other order details
}
```

---

## ⚡ Performance Tips

1. **Images**: Replace placeholder URLs with actual product images
2. **Lazy Loading**: Images are optimized, consider using `Image` component
3. **Bundle Size**: No heavy dependencies, keeps bundle small
4. **SEO**: Update metadata in `app/layout.tsx`

---

## 🧪 Testing Checklist

- [ ] Add product to cart
- [ ] Adjust quantity in cart
- [ ] Remove item from cart
- [ ] Check localStorage persistence (refresh page)
- [ ] Free delivery trigger (over ₹500)
- [ ] Search products
- [ ] Filter by category
- [ ] Mobile responsiveness
- [ ] Form validation in checkout
- [ ] Order success page displays order number

---

## 🚨 Important Notes

- ⚠️ **No Database**: Uses mock data only
- ⚠️ **No Payment**: Order processing is simulated
- ⚠️ **No Authentication**: No user accounts
- ⚠️ **No Notifications**: No email/SMS
- ⚠️ **Images**: All use Unsplash placeholder URLs
- ⚠️ **Orders**: Not persisted beyond localStorage

---

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Unsplash Images](https://unsplash.com)

---

## 📞 Contact Information

Located in footer and contact page:
- **Phone**: +91 98765 43210
- **Email**: info@nutrighar.com
- **WhatsApp**: Available in footer

---

**Last Updated**: August 30, 2024  
**Version**: 1.0 (Complete Frontend)  
**Status**: ✅ Production Ready
