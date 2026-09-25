# NutriGhar - Premium E-Commerce Website

A modern, responsive e-commerce website built with Next.js 16, React, TypeScript, and Tailwind CSS for a homemade food and nutrition business.

## 🎯 Project Overview

NutriGhar is a complete e-commerce platform for selling traditional Indian mithai, peanut butter, protein products, and healthy snacks. The website features a premium design, smooth user experience, and full shopping cart functionality.

## 📂 Project Structure

```
app/
├── page.tsx                    # Home page with hero, categories, featured products
├── layout.tsx                  # Root layout with CartProvider, Navbar, Footer
├── globals.css                 # Global styles
├── products/
│   ├── page.tsx               # Products listing with search and filters
│   └── [id]/page.tsx          # Dynamic product details page
├── cart/page.tsx              # Shopping cart page
├── checkout/page.tsx          # Checkout with order form
├── order-success/page.tsx     # Order confirmation page
├── about/page.tsx             # About Us page
└── contact/page.tsx           # Contact page with form and FAQ

components/
├── Navbar.tsx                 # Responsive navigation
├── Footer.tsx                 # Footer with links and contact
├── ProductCard.tsx            # Individual product card
├── CategoryCard.tsx           # Category showcase card
├── ProductGrid.tsx            # Grid layout for products
└── CartItem.tsx               # Shopping cart item

context/
└── CartContext.tsx            # Cart state management with localStorage

data/
└── products.ts                # Mock product data and categories

types/
└── product.ts                 # TypeScript interfaces
```

## ✨ Features

### Pages

- **Home Page** - Hero section, categories, featured products, newsletter signup
- **Products** - Full catalog with search and category filters
- **Product Details** - Detailed view with ingredients, benefits, related products
- **Shopping Cart** - Add/remove items, adjust quantities, order summary
- **Checkout** - Customer info form, delivery address, order processing
- **Order Success** - Order confirmation with details and next steps
- **About Us** - Company story, values, why choose us
- **Contact** - Contact form, FAQ, support information

### Core Functionality

- ✅ Add products to cart
- ✅ Remove products from cart
- ✅ Adjust product quantities
- ✅ Calculate totals with delivery charges (free over ₹500)
- ✅ Search products by name or description
- ✅ Filter products by category
- ✅ localStorage persistence for cart
- ✅ Responsive mobile-first design
- ✅ Premium warm aesthetic suitable for food business
- ✅ Mock order processing with order number generation

### Product Catalog (12 Products)

**Mithai** (4 products)
- Besan Ladoo (₹299)
- Dry Fruit Ladoo (₹399)
- Coconut Ladoo (₹279)
- Healthy Protein Ladoo (₹349)

**Peanut Butter** (3 products)
- Classic Peanut Butter (₹249)
- Chocolate Peanut Butter (₹299)
- Crunchy Peanut Butter (₹279)

**Protein & Nutrition** (2 products)
- Homemade Protein Mix (₹399)
- High Protein Nutrition Mix (₹449)

**Healthy Snacks** (3 products)
- Roasted Healthy Mix (₹229)
- Protein Energy Bites (₹279)
- Premium Dry Fruit Mix (₹499)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start

# Type checking
npx tsc --noEmit
```

## 🎨 Design Features

- **Color Scheme**: Warm amber/orange primary colors with gray scale
- **Responsive**: Works perfectly on mobile, tablet, and desktop
- **Premium Feel**: Rounded corners, subtle shadows, smooth hover effects
- **Fast Loading**: Optimized images with placeholder URLs
- **Accessible**: Semantic HTML, proper form labels, keyboard navigation

## 💾 Data Persistence

- Cart data is persisted to `localStorage` automatically
- Cart survives page refreshes
- Order data is saved during checkout process
- Last order is stored for confirmation page

## 📦 Technologies

- **Next.js 16.3.3** - React framework with App Router
- **React 19.2.8** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **localStorage API** - Client-side data persistence

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `postcss.config.mjs` - PostCSS/Tailwind config
- `.eslintrc.mjs` - ESLint configuration

## 🛒 Shopping Cart Workflow

1. User browses products on Products page or Home page
2. Clicks "Add to Cart" or quantity in Product Details
3. Cart updates with item count badge
4. User navigates to Cart page
5. Adjusts quantities or removes items
6. Proceeds to Checkout
7. Fills customer and address information
8. Reviews order summary
9. Clicks "Proceed to Payment"
10. Order is processed and redirected to success page
11. Order data persists in localStorage

## 🎯 Cart Logic

- **Free Delivery**: Orders over ₹500 get free delivery
- **Standard Delivery**: ₹60 delivery charge for orders under ₹500
- **Quantity Management**: Increase/decrease quantities or remove items
- **Real-time Calculation**: Totals update instantly
- **localStorage Sync**: Cart persists automatically

## 📱 Mobile Optimization

- **Touch-friendly buttons** - Larger tap targets
- **Responsive grids** - 1 column on mobile, up to 4 on desktop
- **Mobile menu** - Hamburger menu on small screens
- **Optimized images** - Proper sizing and loading
- **Fast navigation** - Smooth scrolling and transitions

## 🔐 TypeScript Safety

- Full TypeScript support with strict mode
- Type-safe components and props
- Interface definitions for all data structures
- No TypeScript errors in build

## ⚡ Performance

- Static pre-rendering for all pages
- Optimized image loading
- Minimal dependencies
- No external UI libraries
- Efficient component structure

## 📝 Next Steps for Development

### Immediate Priorities

1. **Add Database**
   - Replace mock products with real database
   - Implement product CRUD operations
   - Store order history

2. **Implement Authentication**
   - User signup and login
   - Account management
   - Order history per user

3. **Payment Integration**
   - Razorpay or PayU integration
   - Payment verification
   - Invoice generation

4. **Admin Dashboard**
   - Product management
   - Order management
   - Analytics

### Future Enhancements

- Wishlist functionality
- User reviews and ratings
- Coupon/discount codes
- Email notifications
- SMS tracking
- Inventory management
- Multi-language support
- SEO optimization
- Performance monitoring

## 🐛 Known Limitations

- No real payment processing (use mock data)
- No database (uses mock local data)
- No user authentication
- No order history storage
- No email/SMS notifications
- Images use placeholder URLs (easy to replace)

## 🚨 Important Notes

- All product images use Unsplash URLs - replace with your own images
- Order numbers are generated randomly (not tied to database)
- All form submissions are handled client-side with localStorage
- Cart is stored in browser localStorage, not server
- No backup of orders - data is lost on browser cache clear

## 📞 Support

For questions or issues:
- Phone: +91 98765 43210
- Email: info@nutrighar.com
- WhatsApp: Available in footer

## 📄 License

This project is private and confidential for NutriGhar business use only.

---

**Built with ❤️ for NutriGhar - Homemade Goodness Delivered**
