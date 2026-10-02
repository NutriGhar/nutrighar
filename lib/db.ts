// ============================================================
// lib/db.ts — Pure PostgreSQL Data Access Layer for Nutri Ghar
// ALL data is stored and read from PostgreSQL via Prisma.
// No JSON files. No in-memory store. No filesystem writes.
// ============================================================

import prisma from '@/lib/prisma';
import { uploadProductImage } from '@/lib/storage';

// ============================================================
// INTERFACES
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  categoryId: string;
  categorySlug: string;
  image: string;
  images?: string[];
  ingredients: string[];
  benefits: string[];
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  lowStockThreshold: number;
  weight?: string | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  productPrice: number;
  productCategory?: string | null;
  productImage?: string | null;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  orderStatus: 'Pending' | 'Confirmed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'COD';
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  customerId?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlideContent {
  id: string;
  tag: string;
  title: string;
  titleItalic: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  badgeText?: string;
}

export interface CollectionCard {
  id: string;
  categorySlug: string;
  tag: string;
  title: string;
  description: string;
  image: string;
}

export interface CuratedCollectionsContent {
  eyebrow: string;
  heading: string;
  description: string;
  cards: CollectionCard[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  product: string;
  rating: number;
  review: string;
}

export interface TestimonialsContent {
  eyebrow: string;
  heading: string;
  items: TestimonialItem[];
}

export interface ProductSpotlightContent {
  eyebrow: string;
  heading: string;
  headingItalic: string;
  description: string;
  protein: string;
  sugar: string;
  ghee: string;
  freshness: string;
  price: number | string;
  priceNote: string;
  image: string;
  tag: string;
  buttonText: string;
  productSlug?: string;
}

export interface WebsiteContent {
  hero: {
    eyebrow: string;
    headline: string;
    headlineItalic: string;
    supportingText: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    heroImage: string;
  };
  heroSlides: HeroSlideContent[];
  curatedCollections?: CuratedCollectionsContent;
  productSpotlight?: ProductSpotlightContent;
  testimonials?: TestimonialsContent;
  announcement: {
    enabled: boolean;
    text: string;
  };
  brandStory: {
    eyebrow: string;
    heading: string;
    headingItalic: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    storyImage: string;
    quote: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    fssaiLicense: string;
  };
  footer: {
    aboutText: string;
    instagramUrl: string;
    whatsappUrl: string;
    facebookUrl: string;
    copyrightText: string;
  };
  newsletter: {
    heading: string;
    description: string;
    promoNote: string;
  };
}

// ============================================================
// DEFAULT CONTENT (used as fallback if DB has no record yet)
// ============================================================

export const DEFAULT_PRODUCT_SPOTLIGHT: ProductSpotlightContent = {
  eyebrow: 'PRODUCT SPOTLIGHT',
  heading: 'Protein Power Ladoo',
  headingItalic: 'Traditional Taste. Modern Nutrition.',
  description: 'Reimagining India\'s timeless post-meal sweet as an everyday functional superfood. Handcrafted with clean protein, stone-ground oats, roasted California almonds, and 100% pure desi cow ghee.',
  protein: '12g',
  sugar: '0g',
  ghee: '100%',
  freshness: 'Weekly',
  price: 349,
  priceNote: 'Price per 400g Box',
  image: '/images/dry-fruit-ladoo-product.jpg',
  tag: 'Signature Feature',
  buttonText: 'Add to Cart',
  productSlug: 'dry-fruit-ladoo',
};

export const DEFAULT_TESTIMONIALS: TestimonialsContent = {
  eyebrow: 'VERIFIED EXPERIENCES',
  heading: 'Loved Across Indian Homes',
  items: [
    { id: 'test-1', name: 'Priya Sharma', location: 'Mumbai', product: 'Besan Ladoo', rating: 5, review: 'The Besan Ladoos taste exactly like the ones my grandmother prepared during festivals. Pure ghee aroma with zero artificial aftertaste.' },
    { id: 'test-2', name: 'Rajesh Kumar', location: 'Bengaluru', product: 'Creamy Peanut Butter', rating: 5, review: 'Finding a peanut butter that doesn\'t use added palm oil or sugar was impossible until Nutri Ghar. It has become my morning gym staple.' },
    { id: 'test-3', name: 'Anjali Verma', location: 'Delhi NCR', product: 'Protein Power Ladoo', rating: 5, review: 'The Protein Power Ladoos are genuinely incredible. 12g of protein in something that tastes like a traditional delicacy is genius.' },
  ],
};

export const DEFAULT_HERO_SLIDES: HeroSlideContent[] = [
  { id: 'protein-nutrition', tag: 'CLEAN FITNESS NUTRITION', title: 'Your Favourite Treats,', titleItalic: 'Enriched With Clean Protein.', subtitle: '12g+ clean protein per piece with roasted California almonds, pure A2 desi cow ghee, and zero refined sugar.', buttonText: 'Shop High Protein', buttonLink: '/products?category=protein-nutrition', secondaryButtonText: 'Explore Collections', secondaryButtonLink: '/products', image: '/images/clean-protein-pouch-banner.jpg', badgeText: 'Pure Nuts & Seeds Blend' },
  { id: 'dry-fruits-nuts', tag: 'HANDPICKED SUPERFOODS', title: 'Slow-Roasted Nuts,', titleItalic: 'All Flavour, Zero Excess Oil.', subtitle: 'Premium California almonds, whole cashews, and crunch-roasted seed mixes prepared fresh in small batches.', buttonText: 'Explore Roasted Nuts', buttonLink: '/products?category=healthy-snacks', secondaryButtonText: 'View All Snacks', secondaryButtonLink: '/products?category=healthy-snacks', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1400&auto=format&fit=crop&q=85', badgeText: '100% Whole Nuts' },
  { id: 'mithai-ladoos', tag: 'HERITAGE RECIPES', title: 'Pure A2 Desi Ghee Ladoos,', titleItalic: 'The Warmth of Home Kitchen.', subtitle: 'Melt-in-mouth Besan and Motichoor ladoos slow-cooked in 100% pure desi cow ghee and organic jaggery.', buttonText: 'Shop Mithai & Ladoos', buttonLink: '/products?category=mithai', secondaryButtonText: 'Discover Flavours', secondaryButtonLink: '/products', image: '/images/dry-fruit-ladoos-banner.jpg', badgeText: 'Pure Cow Ghee' },
  { id: 'peanut-butter', tag: '100% NATURAL BUTTER', title: 'Stone-Ground Peanuts,', titleItalic: 'Zero Added Palm Oil & Preservatives.', subtitle: 'Slow stone-ground daily for an irresistibly rich texture and deep roasted aroma. Pure plant-based energy.', buttonText: 'Discover Butters', buttonLink: '/products?category=peanut-butter', secondaryButtonText: 'All Spreads', secondaryButtonLink: '/products', image: '/images/peanut-butter-banner.jpg', badgeText: 'Stone-Ground Daily' },
  { id: 'nut-cake-cookies', tag: 'HEALTHY BAKERY CRAFT', title: 'Wholesome Nut Cakes,', titleItalic: 'Guilt-Free Cookies & Bakes.', subtitle: 'Nut-dense artisan cakes and crunchy whole grain cookies sweetened with forest honey and natural jaggery.', buttonText: 'Explore Healthy Treats', buttonLink: '/products?category=healthy-snacks', secondaryButtonText: 'Shop All Bakes', secondaryButtonLink: '/products', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1400&auto=format&fit=crop&q=85', badgeText: 'Zero Maida / No Preservatives' },
];

export const DEFAULT_CURATED_COLLECTIONS: CuratedCollectionsContent = {
  eyebrow: 'CURATED COLLECTIONS',
  heading: 'Pure Food For Everyday Living',
  description: 'From handcrafted ghee mithais to stone-ground peanut butters, explore wholesome nutrition crafted for your family.',
  cards: [
    { id: 'col-mithai', categorySlug: 'mithai', tag: 'HERITAGE SWEETS', title: 'Mithai & Ladoos', description: 'Pure A2 desi cow ghee ladoos crafted with whole dry fruits.', image: '/images/dry-fruit-ladoos-banner.jpg' },
    { id: 'col-peanut-butter', categorySlug: 'peanut-butter', tag: 'STONE-GROUND', title: 'Peanut Butter', description: '100% slow-roasted peanuts stone-ground daily.', image: '/images/peanut-butter-banner.jpg' },
    { id: 'col-protein-nutrition', categorySlug: 'protein-nutrition', tag: 'CLEAN PROTEIN', title: 'Protein & Recovery', description: 'Stone-ground nuts, seeds and clean protein superfood mix.', image: '/images/clean-protein-pouch-banner.jpg' },
    { id: 'col-healthy-snacks', categorySlug: 'healthy-snacks', tag: 'GUILT-FREE CRUNCH', title: 'Healthy Snacks', description: 'Slow-roasted California almonds, cashews and seed mixes.', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80' },
  ],
};

const DEFAULT_WEBSITE_CONTENT: WebsiteContent = {
  hero: { eyebrow: 'HOMEMADE WELLNESS', headline: 'Goodness That', headlineItalic: 'Feels Like Home.', supportingText: 'Naturally made foods and nutrition products crafted with care for your everyday wellness. Pure A2 ghee, stone-ground nuts, and authentic home-style craft.', primaryButtonText: 'Shop Bestsellers', secondaryButtonText: 'Explore Collections', heroImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=80' },
  heroSlides: DEFAULT_HERO_SLIDES,
  curatedCollections: DEFAULT_CURATED_COLLECTIONS,
  productSpotlight: DEFAULT_PRODUCT_SPOTLIGHT,
  testimonials: DEFAULT_TESTIMONIALS,
  announcement: { enabled: true, text: 'Freshly Made • Wholesome Ingredients • Delivered with Care' },
  brandStory: { eyebrow: 'THE NUTRI GHAR WAY', heading: 'Rooted in Tradition.', headingItalic: 'Made for Today.', paragraph1: 'At Nutri Ghar, we believe you shouldn\'t have to choose between the pure, heartwarming flavors of Indian heritage and the clean nutritional standards demanded by modern living.', paragraph2: 'Every jar of stone-ground peanut butter and every handcrafted batch of ladoos begins with 100% whole ingredients: pure A2 desi cow ghee, California almonds, rich roasted gram flour, and wild forest honey.', paragraph3: 'No industrial shortcuts. Zero palm oil, no artificial flavorings, and no chemical preservatives. Just honest, wholesome nutrition prepared exactly the way it would be in your family home.', storyImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1000&auto=format&fit=crop&q=80', quote: '"Food made with the warmth of a mother\'s kitchen nourishes not just the body, but the soul."' },
  contact: { phone: '+91 79761 19153', email: 'Nutrighar2917@gmail.com', whatsapp: '+91 79761 19153', address: 'Nutri Ghar Artisanal Kitchen, Sector 14, Gurugram, Haryana - 122001', fssaiLicense: 'FSSAI Lic: 10823005000214' },
  footer: { aboutText: 'Nutri Ghar represents healthy food made with the warmth and trust of home. Small batches crafted with pure ingredients, zero chemical preservatives, and traditional recipes.', instagramUrl: 'https://instagram.com', whatsappUrl: 'https://wa.me/917976119153', facebookUrl: 'https://facebook.com', copyrightText: `© ${new Date().getFullYear()} Nutri Ghar. Pure homemade nutrition crafted with care.` },
  newsletter: { heading: 'A Little Goodness in Your Inbox.', description: 'Receive thoughtful wellness notes, seasonal kitchen recipes, and priority access to fresh batches.', promoNote: 'We respect your privacy. No spam, ever. Unsubscribe anytime.' },
};

// ============================================================
// DEFAULT SEED DATA
// ============================================================

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-mithai', name: 'Mithai & Ladoo', slug: 'mithai', description: 'Traditional sweets made with pure A2 cow ghee and authentic heritage recipes.', image: '/images/dry-fruit-ladoos-banner.jpg', icon: '🍯', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-peanut-butter', name: 'Peanut Butter', slug: 'peanut-butter', description: '100% stone-ground natural nut butters with zero palm oil or chemical preservatives.', image: '/images/peanut-butter-banner.jpg', icon: '🥜', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-protein-nutrition', name: 'Protein & Nutrition', slug: 'protein-nutrition', description: 'Enriched stone-ground superfood nuts, seeds, and clean protein blends in artisanal kraft packaging.', image: '/images/clean-protein-pouch-banner.jpg', icon: '💪', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-healthy-snacks', name: 'Healthy Snacks', slug: 'healthy-snacks', description: 'Slow-roasted premium nuts, crunchy seeds, and sun-dried fruit assortments.', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80', icon: '🥗', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'besan-ladoo', name: 'Besan Ladoo', slug: 'besan-ladoo', categoryId: 'cat-mithai', categorySlug: 'mithai', price: 299, originalPrice: 349, image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80', images: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80'], description: 'Authentic gram flour ladoos made with pure desi cow ghee and cardamom.', ingredients: ['Roasted Gram Flour', 'Pure A2 Cow Ghee', 'Raw Cane Sugar', 'Cardamom', 'California Almonds'], benefits: ['Rich in Plant Protein', 'Natural Energy Boost', 'Pure Natural Ingredients', 'Freshly Handcrafted'], rating: 4.8, reviewCount: 234, stockQuantity: 45, lowStockThreshold: 10, isFeatured: true, isBestSeller: true, weight: '500g', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'dry-fruit-ladoo', name: 'Premium Dry Fruit Ladoo', slug: 'dry-fruit-ladoo', categoryId: 'cat-mithai', categorySlug: 'mithai', price: 449, originalPrice: 499, image: '/images/dry-fruit-ladoo-product.jpg', images: ['/images/dry-fruit-ladoo-product.jpg', '/images/dry-fruit-ladoos-banner.jpg'], description: 'Luxurious ladoos packed with almonds, cashews, dates, and zero refined sugar.', ingredients: ['Almonds', 'Cashews', 'Medjool Dates', 'Pistachios', 'Pure Cow Ghee'], benefits: ['Rich in Antioxidants', 'Zero Refined Sugar', 'Nutrient Dense Superfood', 'Maternal Kitchen Recipe'], rating: 4.9, reviewCount: 342, stockQuantity: 32, lowStockThreshold: 8, isFeatured: true, isBestSeller: true, weight: '500g', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'classic-peanut-butter', name: 'Classic Creamy Peanut Butter', slug: 'classic-peanut-butter', categoryId: 'cat-peanut-butter', categorySlug: 'peanut-butter', price: 249, originalPrice: 299, image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80', images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80'], description: '100% slow-roasted peanuts stone-ground to silky perfection with zero palm oil.', ingredients: ['100% Roasted Gujarat Peanuts', 'Himalayan Pink Salt'], benefits: ['High Protein (30g/100g)', 'Zero Added Palm Oil', 'No Preservatives', 'Slow Stone Ground'], rating: 4.9, reviewCount: 421, stockQuantity: 60, lowStockThreshold: 15, isFeatured: true, isBestSeller: true, weight: '500g', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'whey-protein-isolate', name: 'NutriGhar Clean Protein & Healthy Mix (500g)', slug: 'whey-protein-isolate', categoryId: 'cat-protein-nutrition', categorySlug: 'protein-nutrition', price: 599, originalPrice: 699, image: '/images/clean-protein-pouch-product.jpg', images: ['/images/clean-protein-pouch-product.jpg', '/images/clean-protein-pouch-banner.jpg'], description: '100% stone-ground healthy mix of roasted California almonds, walnuts, chia seeds, pumpkin seeds, and clean plant protein.', ingredients: ['California Almonds', 'Walnuts', 'Chia Seeds', 'Pumpkin Seeds', 'Flax Seeds', 'Clean Plant Protein', 'Cardamom'], benefits: ['20g Clean Protein per Serving', '100% Stone-Ground Superfoods', 'Zero Palm Oil & Zero Maida', 'Eco-Friendly Kraft Packaging'], rating: 4.9, reviewCount: 198, stockQuantity: 40, lowStockThreshold: 10, isFeatured: true, isBestSeller: true, weight: '500g', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'roasted-almonds', name: 'Himalayan Pink Salt Almonds', slug: 'roasted-almonds', categoryId: 'cat-healthy-snacks', categorySlug: 'healthy-snacks', price: 399, originalPrice: 449, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80', images: ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80'], description: 'Jumbo California almonds slow-roasted without oil, seasoned with pink rock salt.', ingredients: ['Jumbo California Almonds', 'Himalayan Pink Rock Salt'], benefits: ['Oil-Free Roasting', 'Rich in Vitamin E', 'Brain & Heart Health', 'Guilt-Free Crunch'], rating: 4.8, reviewCount: 312, stockQuantity: 40, lowStockThreshold: 10, isFeatured: true, isBestSeller: true, weight: '500g', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// ============================================================
// HELPERS
// ============================================================

function formatProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    categoryId: p.categoryId,
    categorySlug: p.categorySlug,
    image: p.image,
    images: Array.isArray(p.images) ? p.images : [],
    ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    rating: p.rating,
    reviewCount: p.reviewCount,
    stockQuantity: p.stockQuantity,
    lowStockThreshold: p.lowStockThreshold,
    weight: p.weight ?? '500g',
    isFeatured: Boolean(p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller),
    isActive: Boolean(p.isActive),
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
  };
}

function formatCategory(c: any): Category {
  let icon = c.icon ?? null;
  if (!icon || icon === '??' || icon.includes('?')) {
    const slug = (c.slug || '').toLowerCase();
    if (slug.includes('mithai') || slug.includes('ladoo')) icon = '🍯';
    else if (slug.includes('peanut') || slug.includes('butter')) icon = '🥜';
    else if (slug.includes('protein') || slug.includes('nutrition')) icon = '💪';
    else if (slug.includes('snack') || slug.includes('nut') || slug.includes('almond')) icon = '🥗';
    else icon = '📦';
  }

  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    image: c.image ?? null,
    icon,
    isActive: Boolean(c.isActive),
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : String(c.updatedAt),
  };
}

function formatOrder(o: any): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    addressLine1: o.addressLine1,
    addressLine2: o.addressLine2 ?? null,
    city: o.city,
    state: o.state,
    postalCode: o.postalCode,
    orderStatus: o.orderStatus as Order['orderStatus'],
    paymentStatus: o.paymentStatus as Order['paymentStatus'],
    subtotal: o.subtotal,
    deliveryCharge: o.deliveryCharge,
    totalAmount: o.totalAmount,
    customerId: o.customerId ?? null,
    items: Array.isArray(o.items)
      ? o.items.map((i: any) => ({
          id: i.id,
          orderId: i.orderId,
          productId: i.productId ?? null,
          productName: i.productName,
          productPrice: i.productPrice,
          productCategory: i.productCategory ?? null,
          productImage: i.productImage ?? null,
          quantity: i.quantity,
          total: i.total,
        }))
      : [],
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : String(o.updatedAt),
  };
}

// Ensure category exists in DB, upsert if needed
async function ensureCategoryInDB(categoryId: string, categorySlug: string, categories: Category[]): Promise<string> {
  const cleanSlug = categorySlug || categoryId.replace(/^cat-/, '');
  try {
    // 1. Check if category exists by ID
    const existingById = await prisma.category.findUnique({ where: { id: categoryId } }).catch(() => null);
    if (existingById) return existingById.id;

    // 2. Check if category exists by slug
    const existingBySlug = await prisma.category.findUnique({ where: { slug: cleanSlug } }).catch(() => null);
    if (existingBySlug) return existingBySlug.id;

    // 3. Check in categories list
    const catInList = categories.find((c) => c.id === categoryId || c.slug === categorySlug || c.slug === cleanSlug);
    const catName = catInList?.name ?? cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const id = catInList?.id ?? (categoryId.startsWith('cat-') ? categoryId : `cat-${cleanSlug}`);

    const dbCat = await prisma.category.upsert({
      where: { slug: cleanSlug },
      update: { name: catName },
      create: {
        id,
        name: catName,
        slug: cleanSlug,
        description: catInList?.description ?? '',
        icon: catInList?.icon ?? '📦',
        image: catInList?.image ?? null,
        isActive: true,
      },
    });
    return dbCat.id;
  } catch (err: any) {
    console.error('[ensureCategoryInDB] Upsert error:', err.message);
    try {
      const anyCat = await prisma.category.findFirst();
      if (anyCat) return anyCat.id;
    } catch {}
    return categoryId;
  }
}

// ============================================================
// PRODUCT OPERATIONS — Pure PostgreSQL
// ============================================================

export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  search?: string;
}): Promise<Product[]> {
  try {
    const where: any = {};

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }
    if (options?.isFeatured !== undefined) {
      where.isFeatured = options.isFeatured;
    }
    if (options?.isBestSeller !== undefined) {
      where.isBestSeller = options.isBestSeller;
    }
    if (options?.categorySlug) {
      where.categorySlug = options.categorySlug;
    }
    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { categorySlug: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0 && !options?.categorySlug && !options?.categoryId && !options?.search) {
      // First-ever use: seed defaults into DB
      await seedDefaultData();
      const fallbackProducts = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
      return fallbackProducts.map(formatProduct);
    }

    return products.map(formatProduct);
  } catch (err: any) {
    console.error('[getProducts] DB error:', err.message);
    return DEFAULT_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    let product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    // If not found in DB, check if it is one of the defaults and auto-seed into PostgreSQL
    if (!product) {
      const defaultProd = DEFAULT_PRODUCTS.find((p) => p.id === id || p.slug === id);
      if (defaultProd) {
        try {
          const categories = await getCategories(true);
          const catId = await ensureCategoryInDB(defaultProd.categoryId, defaultProd.categorySlug, categories);
          product = await prisma.product.create({
            data: {
              id: defaultProd.id,
              name: defaultProd.name,
              slug: defaultProd.slug,
              description: defaultProd.description,
              price: defaultProd.price,
              originalPrice: defaultProd.originalPrice ?? null,
              categoryId: catId,
              categorySlug: defaultProd.categorySlug,
              image: defaultProd.image,
              images: defaultProd.images ?? [],
              ingredients: defaultProd.ingredients ?? [],
              benefits: defaultProd.benefits ?? [],
              rating: defaultProd.rating,
              reviewCount: defaultProd.reviewCount,
              stockQuantity: defaultProd.stockQuantity,
              lowStockThreshold: defaultProd.lowStockThreshold,
              weight: defaultProd.weight ?? '500g',
              isFeatured: defaultProd.isFeatured,
              isBestSeller: defaultProd.isBestSeller,
              isActive: defaultProd.isActive,
            } as any,
          });
        } catch {
          return defaultProd;
        }
      }
    }

    if (!product) return null;
    return formatProduct(product);
  } catch (err: any) {
    console.error('[getProductById] DB error:', err.message);
    return DEFAULT_PRODUCTS.find((p) => p.id === id || p.slug === id) ?? null;
  }
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = slug || `prod-${Date.now()}`;

  // Handle base64 image upload
  let imageUrl = data.image;
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    const uploadRes = await uploadProductImage({ name: slug, type: 'image/jpeg', base64OrUrl: imageUrl });
    if (uploadRes.success && uploadRes.url) imageUrl = uploadRes.url;
  }

  // Ensure category exists in DB
  const categories = await getCategories(true);
  const dbCategoryId = await ensureCategoryInDB(data.categoryId, data.categorySlug, categories);

  try {
    const created = await prisma.product.upsert({
      where: { slug },
      update: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        categoryId: dbCategoryId,
        categorySlug: data.categorySlug,
        image: imageUrl,
        images: data.images?.length ? data.images : [imageUrl],
        ingredients: data.ingredients ?? [],
        benefits: data.benefits ?? [],
        rating: Number(data.rating) || 5.0,
        reviewCount: Number(data.reviewCount) || 0,
        stockQuantity: Number(data.stockQuantity) >= 0 ? Number(data.stockQuantity) : 50,
        lowStockThreshold: Number(data.lowStockThreshold) >= 0 ? Number(data.lowStockThreshold) : 10,
        weight: data.weight ?? '500g',
        isFeatured: Boolean(data.isFeatured),
        isBestSeller: Boolean(data.isBestSeller),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      } as any,
      create: {
        id,
        name: data.name,
        slug,
        description: data.description,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        categoryId: dbCategoryId,
        categorySlug: data.categorySlug,
        image: imageUrl,
        images: data.images?.length ? data.images : [imageUrl],
        ingredients: data.ingredients ?? [],
        benefits: data.benefits ?? [],
        rating: Number(data.rating) || 5.0,
        reviewCount: Number(data.reviewCount) || 0,
        stockQuantity: Number(data.stockQuantity) >= 0 ? Number(data.stockQuantity) : 50,
        lowStockThreshold: Number(data.lowStockThreshold) >= 0 ? Number(data.lowStockThreshold) : 10,
        weight: data.weight ?? '500g',
        isFeatured: Boolean(data.isFeatured),
        isBestSeller: Boolean(data.isBestSeller),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      } as any,
    });
    console.log(`[createProduct] ✅ Saved product "${created.name}" to PostgreSQL`);
    return formatProduct(created);
  } catch (err: any) {
    console.error('[createProduct] ❌ DB error:', err.message);
    throw err;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  // Handle base64 image
  let imageUrl = updates.image;
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    const uploadRes = await uploadProductImage({ name: `prod-${id}`, type: 'image/jpeg', base64OrUrl: imageUrl });
    if (uploadRes.success && uploadRes.url) {
      imageUrl = uploadRes.url;
      updates.image = imageUrl;
    }
  }

  try {
    const existing = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } });

    // If not existing in DB, auto-seed/create it so editing default or unseeded products works seamlessly
    if (!existing) {
      const defaultProd = DEFAULT_PRODUCTS.find((p) => p.id === id || p.slug === id);
      if (defaultProd || updates.name) {
        console.log(`[updateProduct] Product "${id}" not found in DB, auto-creating in PostgreSQL...`);
        return await createProduct({
          name: updates.name || defaultProd?.name || id,
          slug: updates.slug || defaultProd?.slug || id,
          description: updates.description || defaultProd?.description || '',
          price: updates.price !== undefined ? Number(updates.price) : (defaultProd?.price || 0),
          originalPrice: updates.originalPrice !== undefined ? updates.originalPrice : defaultProd?.originalPrice,
          categoryId: updates.categoryId || defaultProd?.categoryId || 'cat-mithai',
          categorySlug: updates.categorySlug || defaultProd?.categorySlug || 'mithai',
          image: imageUrl || updates.image || defaultProd?.image || '',
          images: updates.images?.length ? updates.images : (defaultProd?.images || (imageUrl ? [imageUrl] : [])),
          ingredients: updates.ingredients || defaultProd?.ingredients || [],
          benefits: updates.benefits || defaultProd?.benefits || [],
          rating: updates.rating !== undefined ? updates.rating : (defaultProd?.rating || 5.0),
          reviewCount: updates.reviewCount !== undefined ? updates.reviewCount : (defaultProd?.reviewCount || 0),
          stockQuantity: updates.stockQuantity !== undefined ? updates.stockQuantity : (defaultProd?.stockQuantity || 50),
          lowStockThreshold: updates.lowStockThreshold !== undefined ? updates.lowStockThreshold : (defaultProd?.lowStockThreshold || 10),
          weight: updates.weight || defaultProd?.weight || '500g',
          isFeatured: updates.isFeatured !== undefined ? updates.isFeatured : (defaultProd?.isFeatured || false),
          isBestSeller: updates.isBestSeller !== undefined ? updates.isBestSeller : (defaultProd?.isBestSeller || false),
          isActive: updates.isActive !== undefined ? updates.isActive : (defaultProd?.isActive ?? true),
        });
      }
      return null;
    }

    const data: any = {
      updatedAt: new Date(),
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.slug !== undefined && { slug: updates.slug }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.price !== undefined && { price: Number(updates.price) }),
      ...(updates.originalPrice !== undefined && { originalPrice: updates.originalPrice ? Number(updates.originalPrice) : null }),
      ...(updates.categorySlug !== undefined && { categorySlug: updates.categorySlug }),
      ...(imageUrl !== undefined && { image: imageUrl, images: updates.images?.length ? updates.images : [imageUrl] }),
      ...(updates.images?.length && !imageUrl && { images: updates.images }),
      ...(updates.ingredients !== undefined && { ingredients: updates.ingredients }),
      ...(updates.benefits !== undefined && { benefits: updates.benefits }),
      ...(updates.rating !== undefined && { rating: Number(updates.rating) }),
      ...(updates.reviewCount !== undefined && { reviewCount: Number(updates.reviewCount) }),
      ...(updates.stockQuantity !== undefined && { stockQuantity: Number(updates.stockQuantity) }),
      ...(updates.lowStockThreshold !== undefined && { lowStockThreshold: Number(updates.lowStockThreshold) }),
      ...(updates.weight !== undefined && { weight: updates.weight }),
      ...(updates.isFeatured !== undefined && { isFeatured: Boolean(updates.isFeatured) }),
      ...(updates.isBestSeller !== undefined && { isBestSeller: Boolean(updates.isBestSeller) }),
      ...(updates.isActive !== undefined && { isActive: Boolean(updates.isActive) }),
    };

    // Update category if changed
    if (updates.categoryId || updates.categorySlug) {
      const catSlug = updates.categorySlug ?? existing.categorySlug;
      const catId = updates.categoryId ?? existing.categoryId;
      const categories = await getCategories(true);
      data.categoryId = await ensureCategoryInDB(catId, catSlug, categories);
      data.categorySlug = catSlug;
    }

    const updated = await prisma.product.update({ where: { id: existing.id }, data });
    console.log(`[updateProduct] ✅ Updated product "${updated.name}" in PostgreSQL`);
    return formatProduct(updated);
  } catch (err: any) {
    console.error('[updateProduct] ❌ DB error:', err.message);
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const existing = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!existing) return false;
    await prisma.product.delete({ where: { id: existing.id } });
    console.log(`[deleteProduct] ✅ Deleted product "${existing.name}" from PostgreSQL`);
    return true;
  } catch (err: any) {
    console.error('[deleteProduct] ❌ DB error:', err.message);
    return false;
  }
}

// ============================================================
// CATEGORY OPERATIONS — Pure PostgreSQL
// ============================================================

export async function getCategories(includeInactive = false): Promise<Category[]> {
  try {
    const where = includeInactive ? {} : { isActive: true };
    const categories = await prisma.category.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    if (categories.length === 0) {
      await seedDefaultData();
      return includeInactive ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.filter((c) => c.isActive);
    }

    // Auto-sync legacy Unsplash placeholder images & corrupted icons to official NutriGhar banner images and emojis
    for (const cat of categories) {
      const defaultMatch = DEFAULT_CATEGORIES.find((d) => d.slug === cat.slug);
      const isCorruptedIcon = !cat.icon || cat.icon === '??' || cat.icon.includes('?');
      const isLegacyImage =
        !cat.image ||
        cat.image.includes('photo-1601050690597') || // legacy samosa
        cat.image.includes('photo-1590080875515') || // legacy rice krispie
        cat.image.includes('photo-1540420773420') || // legacy salad
        cat.image.includes('photo-1599599810769') || // legacy placeholder
        cat.image.includes('unsplash.com/photo-1556910103');

      if (defaultMatch && (isLegacyImage || isCorruptedIcon)) {
        try {
          const targetImage = isLegacyImage ? defaultMatch.image : cat.image;
          const targetIcon = isCorruptedIcon ? defaultMatch.icon : cat.icon;
          await prisma.category.update({
            where: { id: cat.id },
            data: { image: targetImage ?? null, icon: targetIcon ?? null },
          });
          cat.image = targetImage ?? null;
          cat.icon = targetIcon ?? null;
        } catch {}
      }
    }

    return categories.map(formatCategory);
  } catch (err: any) {
    console.error('[getCategories] DB error:', err.message);
    return includeInactive ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.filter((c) => c.isActive);
  }
}

export async function syncOfficialCategories(): Promise<Category[]> {
  for (const defaultCat of DEFAULT_CATEGORIES) {
    try {
      await prisma.category.upsert({
        where: { slug: defaultCat.slug },
        update: {
          name: defaultCat.name,
          image: defaultCat.image ?? null,
          icon: defaultCat.icon ?? null,
          description: defaultCat.description ?? null,
        },
        create: {
          id: defaultCat.id,
          name: defaultCat.name,
          slug: defaultCat.slug,
          description: defaultCat.description ?? null,
          image: defaultCat.image ?? null,
          icon: defaultCat.icon ?? null,
          isActive: true,
        },
      });
    } catch (err: any) {
      console.error(`[syncOfficialCategories] Error syncing ${defaultCat.slug}:`, err.message);
    }
  }
  return getCategories(true);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const cat = await prisma.category.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!cat) return null;
    return formatCategory(cat);
  } catch (err: any) {
    console.error('[getCategoryById] DB error:', err.message);
    return DEFAULT_CATEGORIES.find((c) => c.id === id || c.slug === id) ?? null;
  }
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `cat-${slug}`;

  let imageUrl = data.image;
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    const uploadRes = await uploadProductImage({ name: `cat-${slug}`, type: 'image/jpeg', base64OrUrl: imageUrl });
    if (uploadRes.success && uploadRes.url) imageUrl = uploadRes.url;
  }

  try {
    const created = await prisma.category.upsert({
      where: { slug },
      update: {
        name: data.name,
        description: data.description ?? null,
        image: imageUrl ?? null,
        icon: data.icon ?? '📦',
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
      create: {
        id,
        name: data.name,
        slug,
        description: data.description ?? null,
        image: imageUrl ?? null,
        icon: data.icon ?? '📦',
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
    console.log(`[createCategory] ✅ Saved category "${created.name}" to PostgreSQL`);
    return formatCategory(created);
  } catch (err: any) {
    console.error('[createCategory] ❌ DB error:', err.message);
    throw err;
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  let imageUrl = updates.image;
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    const uploadRes = await uploadProductImage({ name: `cat-${id}`, type: 'image/jpeg', base64OrUrl: imageUrl });
    if (uploadRes.success && uploadRes.url) imageUrl = uploadRes.url;
  }

  try {
    const existing = await prisma.category.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!existing) return null;

    const data: any = {
      updatedAt: new Date(),
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.slug !== undefined && { slug: updates.slug }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(imageUrl !== undefined && { image: imageUrl }),
      ...(updates.icon !== undefined && { icon: updates.icon }),
      ...(updates.isActive !== undefined && { isActive: Boolean(updates.isActive) }),
    };

    const updated = await prisma.category.update({ where: { id: existing.id }, data });
    console.log(`[updateCategory] ✅ Updated category "${updated.name}" in PostgreSQL`);
    return formatCategory(updated);
  } catch (err: any) {
    console.error('[updateCategory] ❌ DB error:', err.message);
    return null;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const existing = await prisma.category.findFirst({ where: { OR: [{ id }, { slug: id }] } });
    if (!existing) return false;
    await prisma.category.delete({ where: { id: existing.id } });
    console.log(`[deleteCategory] ✅ Deleted category "${existing.name}" from PostgreSQL`);
    return true;
  } catch (err: any) {
    console.error('[deleteCategory] ❌ DB error:', err.message);
    return false;
  }
}

// ============================================================
// ORDER OPERATIONS — Pure PostgreSQL
// ============================================================

export async function getOrders(statusFilter?: string): Promise<Order[]> {
  try {
    const where: any = {};
    if (statusFilter && statusFilter !== 'All') {
      where.orderStatus = { equals: statusFilter, mode: 'insensitive' };
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(formatOrder);
  } catch (err: any) {
    console.error('[getOrders] DB error:', err.message);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });
    if (!order) return null;
    return formatOrder(order);
  } catch (err: any) {
    console.error('[getOrderById] DB error:', err.message);
    return null;
  }
}

export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'COD';
  items: Array<{
    productId?: string;
    productName: string;
    productPrice: number;
    productCategory?: string;
    productImage?: string;
    quantity: number;
  }>;
}): Promise<Order> {
  const orderNumber = `NG${Math.floor(100000 + Math.random() * 900000)}`;
  const subtotal = data.items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
  const deliveryCharge = subtotal > 500 ? 0 : 60;
  const totalAmount = subtotal + deliveryCharge;

  try {
    // Resolve productId to actual DB product ID if it exists
    const itemsWithResolvedIds = await Promise.all(
      data.items.map(async (item) => {
        let resolvedProductId: string | null = null;
        if (item.productId) {
          try {
            const prod = await prisma.product.findFirst({
              where: { OR: [{ id: item.productId }, { slug: item.productId }] },
              select: { id: true },
            });
            resolvedProductId = prod?.id ?? null;
          } catch {
            resolvedProductId = null;
          }
        }
        return {
          productId: resolvedProductId,
          productName: item.productName,
          productPrice: Number(item.productPrice),
          productCategory: item.productCategory ?? null,
          productImage: item.productImage ?? null,
          quantity: Number(item.quantity),
          total: Number(item.productPrice) * Number(item.quantity),
        };
      })
    );

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        orderStatus: 'Pending',
        paymentStatus: data.paymentStatus ?? 'Paid',
        subtotal,
        deliveryCharge,
        totalAmount,
        items: {
          create: itemsWithResolvedIds,
        },
      },
      include: { items: true },
    });

    // Decrement stock for each ordered product
    for (const item of itemsWithResolvedIds) {
      if (item.productId) {
        try {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        } catch {
          // Non-critical: stock update failure doesn't block order
        }
      }
    }

    console.log(`[createOrder] ✅ Order ${orderNumber} saved to PostgreSQL`);
    return formatOrder(order);
  } catch (err: any) {
    console.error('[createOrder] ❌ DB error:', err.message);
    throw err;
  }
}

export async function updateOrderStatus(
  id: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): Promise<Order | null> {
  try {
    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });
    if (!existing) return null;

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        orderStatus,
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    console.log(`[updateOrderStatus] ✅ Order ${updated.orderNumber} status → ${orderStatus}`);
    return formatOrder(updated);
  } catch (err: any) {
    console.error('[updateOrderStatus] ❌ DB error:', err.message);
    return null;
  }
}

// ============================================================
// WEBSITE CONTENT OPERATIONS — Pure PostgreSQL
// ============================================================

export async function getWebsiteContent(): Promise<WebsiteContent> {
  const raw: any = {};

  try {
    const dbRecords = await prisma.websiteContent.findMany();
    for (const r of dbRecords) {
      // Skip catalog sections (those are for products/categories)
      if (r.section === 'catalog_products' || r.section === 'catalog_categories') continue;
      raw[r.section] = r.data;
    }
  } catch (err: any) {
    console.error('[getWebsiteContent] DB error:', err.message);
  }

  return {
    ...DEFAULT_WEBSITE_CONTENT,
    ...raw,
    hero: { ...DEFAULT_WEBSITE_CONTENT.hero, ...(raw.hero || {}) },
    productSpotlight: { ...DEFAULT_PRODUCT_SPOTLIGHT, ...(raw.productSpotlight || {}) },
    curatedCollections: {
      ...DEFAULT_CURATED_COLLECTIONS,
      ...(raw.curatedCollections || {}),
      cards: (raw.curatedCollections?.cards && Array.isArray(raw.curatedCollections.cards) && raw.curatedCollections.cards.length > 0)
        ? raw.curatedCollections.cards
        : DEFAULT_CURATED_COLLECTIONS.cards,
    },
    testimonials: {
      ...DEFAULT_TESTIMONIALS,
      ...(raw.testimonials || {}),
      items: (raw.testimonials?.items && Array.isArray(raw.testimonials.items) && raw.testimonials.items.length > 0)
        ? raw.testimonials.items
        : DEFAULT_TESTIMONIALS.items,
    },
    heroSlides: (raw.heroSlides && Array.isArray(raw.heroSlides) && raw.heroSlides.length > 0)
      ? raw.heroSlides
      : DEFAULT_HERO_SLIDES,
  };
}

export async function updateWebsiteContent(section: keyof WebsiteContent, data: any): Promise<WebsiteContent> {
  let payloadData: any;
  if (Array.isArray(data)) {
    payloadData = data;
  } else if (typeof data === 'object' && data !== null) {
    const current = await getWebsiteContent();
    const currentSection = (current as any)[section] || (DEFAULT_WEBSITE_CONTENT as any)[section] || {};
    payloadData = { ...currentSection, ...data };
  } else {
    payloadData = data;
  }

  // Handle hero slide image uploads
  if (section === 'heroSlides' && Array.isArray(payloadData)) {
    for (let i = 0; i < payloadData.length; i++) {
      const slide = payloadData[i];
      if (slide.image && slide.image.startsWith('data:image/')) {
        const uploadRes = await uploadProductImage({ name: `slide-${i}-${Date.now()}`, type: 'image/jpeg', base64OrUrl: slide.image });
        if (uploadRes.success && uploadRes.url) slide.image = uploadRes.url;
      }
    }
  }

  try {
    await prisma.websiteContent.upsert({
      where: { section: String(section) },
      update: { data: payloadData },
      create: { section: String(section), data: payloadData },
    });
    console.log(`[updateWebsiteContent] ✅ Section "${String(section)}" saved to PostgreSQL`);
  } catch (err: any) {
    console.error(`[updateWebsiteContent] ❌ DB error for section "${String(section)}":`, err.message);
    throw err;
  }

  return getWebsiteContent();
}

// ============================================================
// ADMIN DASHBOARD STATS — Pure PostgreSQL
// ============================================================

export async function getAdminStats() {
  try {
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenueResult,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: { in: ['Pending', 'Preparing'] } } }),
      prisma.order.count({ where: { orderStatus: 'Delivered' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { OR: [{ paymentStatus: 'Paid' }, { orderStatus: 'Delivered' }] },
      }),
      prisma.product.findMany({
        where: { isActive: true, stockQuantity: { lte: 10 } },
        select: { id: true, name: true, image: true, stockQuantity: true, lowStockThreshold: true, price: true, categorySlug: true },
        take: 8,
        orderBy: { stockQuantity: 'asc' },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { productName: true, quantity: true } } },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue: revenueResult._sum.totalAmount ?? 0,
      lowStockProducts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
        items: o.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
      })),
    };
  } catch (err: any) {
    console.error('[getAdminStats] DB error:', err.message);
    return { totalProducts: 0, activeProducts: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalRevenue: 0, lowStockProducts: [], recentOrders: [] };
  }
}

// ============================================================
// NEWSLETTER SUBSCRIBERS — stored in PostgreSQL WebsiteContent
// ============================================================

async function getSubscribersFromDB(): Promise<string[]> {
  try {
    const record = await prisma.websiteContent.findUnique({ where: { section: 'newsletter_subscribers' } });
    if (record && Array.isArray(record.data)) {
      return record.data as string[];
    }
    return [];
  } catch {
    return [];
  }
}

async function saveSubscribersToDB(subscribers: string[]): Promise<void> {
  await prisma.websiteContent.upsert({
    where: { section: 'newsletter_subscribers' },
    update: { data: subscribers as any },
    create: { section: 'newsletter_subscribers', data: subscribers as any },
  });
}

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; isNew: boolean }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Invalid email address provided', isNew: false };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const subscribers = await getSubscribersFromDB();

    if (subscribers.includes(cleanEmail)) {
      return { success: true, message: 'You are already subscribed to Nutri Ghar updates!', isNew: false };
    }

    subscribers.push(cleanEmail);
    await saveSubscribersToDB(subscribers);
    console.log(`[addSubscriber] ✅ Subscriber ${cleanEmail} saved to PostgreSQL`);
    return { success: true, message: 'Thank you for subscribing to Nutri Ghar wellness notes & batch updates!', isNew: true };
  } catch (err: any) {
    console.error('[addSubscriber] ❌ DB error:', err.message);
    return { success: false, message: 'Failed to subscribe. Please try again.', isNew: false };
  }
}

export async function getSubscribers(): Promise<string[]> {
  return getSubscribersFromDB();
}

// ============================================================
// SEED DEFAULT DATA (only runs once on first DB setup)
// ============================================================

async function seedDefaultData(): Promise<void> {
  try {
    // Seed categories
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description ?? null,
          image: cat.image ?? null,
          icon: cat.icon ?? '📦',
          isActive: cat.isActive,
        },
      });
    }

    // Seed products
    for (const prod of DEFAULT_PRODUCTS) {
      const cat = await prisma.category.findUnique({ where: { slug: prod.categorySlug } });
      const categoryId = cat?.id || prod.categoryId;

      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {},
        create: {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          originalPrice: prod.originalPrice ?? null,
          categoryId: categoryId,
          categorySlug: prod.categorySlug,
          image: prod.image,
          images: prod.images ?? [],
          ingredients: prod.ingredients ?? [],
          benefits: prod.benefits ?? [],
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          stockQuantity: prod.stockQuantity,
          lowStockThreshold: prod.lowStockThreshold,
          weight: '500g',
          isFeatured: prod.isFeatured,
          isBestSeller: prod.isBestSeller,
          isActive: prod.isActive,
        } as any,
      });
    }

    console.log('[seedDefaultData] ✅ Default products and categories seeded to PostgreSQL');
  } catch (err: any) {
    console.error('[seedDefaultData] Seed warning:', err.message);
  }
}
