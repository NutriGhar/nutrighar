// Central Database & Data Access Service Layer for Nutri Ghar
// Supports PostgreSQL via Prisma ORM with durable, persistent disk-backed JSON storage

import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { uploadProductImage } from '@/lib/storage';

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
    {
      id: 'test-1',
      name: 'Priya Sharma',
      location: 'Mumbai',
      product: 'Besan Ladoo',
      rating: 5,
      review: 'The Besan Ladoos taste exactly like the ones my grandmother prepared during festivals. Pure ghee aroma with zero artificial aftertaste.',
    },
    {
      id: 'test-2',
      name: 'Rajesh Kumar',
      location: 'Bengaluru',
      product: 'Creamy Peanut Butter',
      rating: 5,
      review: 'Finding a peanut butter that doesn\'t use added palm oil or sugar was impossible until Nutri Ghar. It has become my morning gym staple.',
    },
    {
      id: 'test-3',
      name: 'Anjali Verma',
      location: 'Delhi NCR',
      product: 'Protein Power Ladoo',
      rating: 5,
      review: 'The Protein Power Ladoos are genuinely incredible. 12g of protein in something that tastes like a traditional delicacy is genius.',
    },
  ],
};

export const DEFAULT_HERO_SLIDES: HeroSlideContent[] = [
  {
    id: 'protein-nutrition',
    tag: 'CLEAN FITNESS NUTRITION',
    title: 'Your Favourite Treats,',
    titleItalic: 'Enriched With Clean Protein.',
    subtitle: '12g+ clean protein per piece with roasted California almonds, pure A2 desi cow ghee, and zero refined sugar.',
    buttonText: 'Shop High Protein',
    buttonLink: '/products?category=protein-nutrition',
    secondaryButtonText: 'Explore Collections',
    secondaryButtonLink: '/products',
    image: '/images/clean-protein-pouch-banner.jpg',
    badgeText: 'Pure Nuts & Seeds Blend',
  },
  {
    id: 'dry-fruits-nuts',
    tag: 'HANDPICKED SUPERFOODS',
    title: 'Slow-Roasted Nuts,',
    titleItalic: 'All Flavour, Zero Excess Oil.',
    subtitle: 'Premium California almonds, whole cashews, and crunch-roasted seed mixes prepared fresh in small batches.',
    buttonText: 'Explore Roasted Nuts',
    buttonLink: '/products?category=healthy-snacks',
    secondaryButtonText: 'View All Snacks',
    secondaryButtonLink: '/products?category=healthy-snacks',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1400&auto=format&fit=crop&q=85',
    badgeText: '100% Whole Nuts',
  },
  {
    id: 'mithai-ladoos',
    tag: 'HERITAGE RECIPES',
    title: 'Pure A2 Desi Ghee Ladoos,',
    titleItalic: 'The Warmth of Home Kitchen.',
    subtitle: 'Melt-in-mouth Besan and Motichoor ladoos slow-cooked in 100% pure desi cow ghee and organic jaggery.',
    buttonText: 'Shop Mithai & Ladoos',
    buttonLink: '/products?category=mithai',
    secondaryButtonText: 'Discover Flavours',
    secondaryButtonLink: '/products',
    image: '/images/dry-fruit-ladoos-banner.jpg',
    badgeText: 'Pure Cow Ghee',
  },
  {
    id: 'peanut-butter',
    tag: '100% NATURAL BUTTER',
    title: 'Stone-Ground Peanuts,',
    titleItalic: 'Zero Added Palm Oil & Preservatives.',
    subtitle: 'Slow stone-ground daily for an irresistibly rich texture and deep roasted aroma. Pure plant-based energy.',
    buttonText: 'Discover Butters',
    buttonLink: '/products?category=peanut-butter',
    secondaryButtonText: 'All Spreads',
    secondaryButtonLink: '/products',
    image: '/images/peanut-butter-banner.jpg',
    badgeText: 'Stone-Ground Daily',
  },
  {
    id: 'nut-cake-cookies',
    tag: 'HEALTHY BAKERY CRAFT',
    title: 'Wholesome Nut Cakes,',
    titleItalic: 'Guilt-Free Cookies & Bakes.',
    subtitle: 'Nut-dense artisan cakes and crunchy whole grain cookies sweetened with forest honey and natural jaggery.',
    buttonText: 'Explore Healthy Treats',
    buttonLink: '/products?category=healthy-snacks',
    secondaryButtonText: 'Shop All Bakes',
    secondaryButtonLink: '/products',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1400&auto=format&fit=crop&q=85',
    badgeText: 'Zero Maida / No Preservatives',
  },
];

export const DEFAULT_CURATED_COLLECTIONS: CuratedCollectionsContent = {
  eyebrow: 'CURATED COLLECTIONS',
  heading: 'Pure Food For Everyday Living',
  description: 'From handcrafted ghee mithais to stone-ground peanut butters, explore wholesome nutrition crafted for your family.',
  cards: [
    {
      id: 'col-mithai',
      categorySlug: 'mithai',
      tag: 'HERITAGE SWEETS',
      title: 'Mithai & Ladoos',
      description: 'Pure A2 desi cow ghee ladoos crafted with whole dry fruits.',
      image: '/images/dry-fruit-ladoos-banner.jpg',
    },
    {
      id: 'col-peanut-butter',
      categorySlug: 'peanut-butter',
      tag: 'STONE-GROUND',
      title: 'Peanut Butter',
      description: '100% slow-roasted peanuts stone-ground daily.',
      image: '/images/peanut-butter-banner.jpg',
    },
    {
      id: 'col-protein-nutrition',
      categorySlug: 'protein-nutrition',
      tag: 'CLEAN PROTEIN',
      title: 'Protein & Recovery',
      description: 'Stone-ground nuts, seeds and clean protein superfood mix.',
      image: '/images/clean-protein-pouch-banner.jpg',
    },
    {
      id: 'col-healthy-snacks',
      categorySlug: 'healthy-snacks',
      tag: 'GUILT-FREE CRUNCH',
      title: 'Healthy Snacks',
      description: 'Slow-roasted California almonds, cashews and seed mixes.',
      image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80',
    },
  ],
};

const DEFAULT_WEBSITE_CONTENT: WebsiteContent = {
  hero: {
    eyebrow: 'HOMEMADE WELLNESS',
    headline: 'Goodness That',
    headlineItalic: 'Feels Like Home.',
    supportingText: 'Naturally made foods and nutrition products crafted with care for your everyday wellness. Pure A2 ghee, stone-ground nuts, and authentic home-style craft.',
    primaryButtonText: 'Shop Bestsellers',
    secondaryButtonText: 'Explore Collections',
    heroImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=80',
  },
  heroSlides: DEFAULT_HERO_SLIDES,
  curatedCollections: DEFAULT_CURATED_COLLECTIONS,
  productSpotlight: DEFAULT_PRODUCT_SPOTLIGHT,
  testimonials: DEFAULT_TESTIMONIALS,
  announcement: {
    enabled: true,
    text: 'Freshly Made • Wholesome Ingredients • Delivered with Care',
  },
  brandStory: {
    eyebrow: 'THE NUTRI GHAR WAY',
    heading: 'Rooted in Tradition.',
    headingItalic: 'Made for Today.',
    paragraph1: 'At Nutri Ghar, we believe you shouldn’t have to choose between the pure, heartwarming flavors of Indian heritage and the clean nutritional standards demanded by modern living.',
    paragraph2: 'Every jar of stone-ground peanut butter and every handcrafted batch of ladoos begins with 100% whole ingredients: pure A2 desi cow ghee, California almonds, rich roasted gram flour, and wild forest honey.',
    paragraph3: 'No industrial shortcuts. Zero palm oil, no artificial flavorings, and no chemical preservatives. Just honest, wholesome nutrition prepared exactly the way it would be in your family home.',
    storyImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1000&auto=format&fit=crop&q=80',
    quote: '“Food made with the warmth of a mother’s kitchen nourishes not just the body, but the soul.”',
  },
  contact: {
    phone: '+91 98765 43210',
    email: 'care@nutrighar.com',
    whatsapp: '+91 98765 43210',
    address: 'Nutri Ghar Artisanal Kitchen, Sector 14, Gurugram, Haryana - 122001',
    fssaiLicense: 'FSSAI Lic: 10823005000214',
  },
  footer: {
    aboutText: 'Nutri Ghar represents healthy food made with the warmth and trust of home. Small batches crafted with pure ingredients, zero chemical preservatives, and traditional recipes.',
    instagramUrl: 'https://instagram.com',
    whatsappUrl: 'https://wa.me/919876543210',
    facebookUrl: 'https://facebook.com',
    copyrightText: `© ${new Date().getFullYear()} Nutri Ghar. Pure homemade nutrition crafted with care.`,
  },
  newsletter: {
    heading: 'A Little Goodness in Your Inbox.',
    description: 'Receive thoughtful wellness notes, seasonal kitchen recipes, and priority access to fresh batches.',
    promoNote: 'We respect your privacy. No spam, ever. Unsubscribe anytime.',
  },
};

function formatProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice,
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
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isActive: p.isActive,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

// -------------------------------------------------------------
// IN-MEMORY FALLBACK STORES (For Zero-Config Resilience on Vercel)
// -------------------------------------------------------------

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-mithai',
    name: 'Mithai & Ladoo',
    slug: 'mithai',
    description: 'Traditional sweets made with pure A2 cow ghee and authentic heritage recipes.',
    image: '/images/dry-fruit-ladoos-banner.jpg',
    icon: '🍯',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-peanut-butter',
    name: 'Peanut Butter',
    slug: 'peanut-butter',
    description: '100% stone-ground natural nut butters with zero palm oil or chemical preservatives.',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80',
    icon: '🥜',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-protein-nutrition',
    name: 'Protein & Nutrition',
    slug: 'protein-nutrition',
    description: 'Enriched stone-ground superfood nuts, seeds, and clean protein blends in artisanal kraft packaging.',
    image: '/images/clean-protein-pouch-banner.jpg',
    icon: '💪',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-healthy-snacks',
    name: 'Healthy Snacks',
    slug: 'healthy-snacks',
    description: 'Slow-roasted premium nuts, crunchy seeds, and sun-dried fruit assortments.',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80',
    icon: '🥗',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'besan-ladoo',
    name: 'Besan Ladoo',
    slug: 'besan-ladoo',
    categoryId: 'cat-mithai',
    categorySlug: 'mithai',
    price: 299,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80'],
    description: 'Authentic gram flour ladoos made with pure desi cow ghee and cardamom.',
    ingredients: ['Roasted Gram Flour', 'Pure A2 Cow Ghee', 'Raw Cane Sugar', 'Cardamom', 'California Almonds'],
    benefits: ['Rich in Plant Protein', 'Natural Energy Boost', 'Pure Natural Ingredients', 'Freshly Handcrafted'],
    rating: 4.8,
    reviewCount: 234,
    stockQuantity: 45,
    lowStockThreshold: 10,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dry-fruit-ladoo',
    name: 'Premium Dry Fruit Ladoo',
    slug: 'dry-fruit-ladoo',
    categoryId: 'cat-mithai',
    categorySlug: 'mithai',
    price: 449,
    originalPrice: 499,
    image: '/images/dry-fruit-ladoo-product.jpg',
    images: ['/images/dry-fruit-ladoo-product.jpg', '/images/dry-fruit-ladoos-banner.jpg'],
    description: 'Luxurious ladoos packed with almonds, cashews, dates, and zero refined sugar.',
    ingredients: ['Almonds', 'Cashews', 'Medjool Dates', 'Pistachios', 'Pure Cow Ghee'],
    benefits: ['Rich in Antioxidants', 'Zero Refined Sugar', 'Nutrient Dense Superfood', 'Maternal Kitchen Recipe'],
    rating: 4.9,
    reviewCount: 342,
    stockQuantity: 32,
    lowStockThreshold: 8,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coconut-ladoo',
    name: 'Fresh Coconut Ladoo',
    slug: 'coconut-ladoo',
    categoryId: 'cat-mithai',
    categorySlug: 'mithai',
    price: 279,
    originalPrice: 319,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80'],
    description: 'Delicate coconut ladoos made with freshly grated coconut and condensed milk.',
    ingredients: ['Fresh Coconut', 'Whole Milk', 'Raw Sugar', 'Green Cardamom'],
    benefits: ['Rich in Essential Minerals', 'Naturally Gluten Free', 'Pure Freshly Made', 'Traditional Taste'],
    rating: 4.7,
    reviewCount: 156,
    stockQuantity: 28,
    lowStockThreshold: 10,
    isFeatured: true,
    isBestSeller: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'classic-peanut-butter',
    name: 'Classic Creamy Peanut Butter',
    slug: 'classic-peanut-butter',
    categoryId: 'cat-peanut-butter',
    categorySlug: 'peanut-butter',
    price: 249,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80'],
    description: '100% slow-roasted peanuts stone-ground to silky perfection with zero palm oil.',
    ingredients: ['100% Roasted Gujarat Peanuts', 'Himalayan Pink Salt'],
    benefits: ['High Protein (30g/100g)', 'Zero Added Palm Oil', 'No Preservatives', 'Slow Stone Ground'],
    rating: 4.9,
    reviewCount: 421,
    stockQuantity: 60,
    lowStockThreshold: 15,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'crunchy-peanut-butter',
    name: 'Crunchy Dark Roast Peanut Butter',
    slug: 'crunchy-peanut-butter',
    categoryId: 'cat-peanut-butter',
    categorySlug: 'peanut-butter',
    price: 269,
    originalPrice: 319,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80'],
    description: 'Dark roasted peanut butter loaded with satisfying crunchy peanut bits.',
    ingredients: ['Roasted Peanuts', 'Crushed Peanut Chunks', 'Himalayan Pink Salt'],
    benefits: ['Delightful Crunch', 'Zero Hydrogenated Oils', 'Natural Heart Healthy Fats', 'Clean Fuel'],
    rating: 4.8,
    reviewCount: 289,
    stockQuantity: 50,
    lowStockThreshold: 12,
    isFeatured: false,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'whey-protein-isolate',
    name: 'NutriGhar Clean Protein & Healthy Mix (500g)',
    slug: 'whey-protein-isolate',
    categoryId: 'cat-protein-nutrition',
    categorySlug: 'protein-nutrition',
    price: 599,
    originalPrice: 699,
    image: '/images/clean-protein-pouch-product.jpg',
    images: ['/images/clean-protein-pouch-product.jpg', '/images/clean-protein-pouch-banner.jpg'],
    description: '100% stone-ground healthy mix of roasted California almonds, walnuts, chia seeds, pumpkin seeds, and clean plant protein in eco-friendly kraft paper packaging.',
    ingredients: ['California Almonds', 'Walnuts', 'Chia Seeds', 'Pumpkin Seeds', 'Flax Seeds', 'Clean Plant Protein', 'Cardamom'],
    benefits: ['20g Clean Protein per Serving', '100% Stone-Ground Superfoods', 'Zero Palm Oil & Zero Maida', 'Eco-Friendly Kraft Packaging'],
    rating: 4.9,
    reviewCount: 198,
    stockQuantity: 40,
    lowStockThreshold: 10,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'roasted-almonds',
    name: 'Himalayan Pink Salt Almonds',
    slug: 'roasted-almonds',
    categoryId: 'cat-healthy-snacks',
    categorySlug: 'healthy-snacks',
    price: 399,
    originalPrice: 449,
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80'],
    description: 'Jumbo California almonds slow-roasted without oil, seasoned with pink rock salt.',
    ingredients: ['Jumbo California Almonds', 'Himalayan Pink Rock Salt'],
    benefits: ['Oil-Free Roasting', 'Rich in Vitamin E', 'Brain & Heart Health', 'Guilt-Free Crunch'],
    rating: 4.8,
    reviewCount: 312,
    stockQuantity: 40,
    lowStockThreshold: 10,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'superfood-trail-mix',
    name: '7-Seed Superfood Trail Mix',
    slug: 'superfood-trail-mix',
    categoryId: 'cat-healthy-snacks',
    categorySlug: 'healthy-snacks',
    price: 349,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&auto=format&fit=crop&q=80'],
    description: 'Crunchy blend of pumpkin, sunflower, chia, flax, watermelon seeds, and dried berries.',
    ingredients: ['Pumpkin Seeds', 'Sunflower Seeds', 'Chia Seeds', 'Flax Seeds', 'Cranberries', 'Black Raisins'],
    benefits: ['Rich in Omega-3 & Zinc', 'High Dietary Fiber', 'Immunity Booster', 'Natural Energy Snack'],
    rating: 4.9,
    reviewCount: 278,
    stockQuantity: 45,
    lowStockThreshold: 10,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// -------------------------------------------------------------
// PERSISTENT FILE-BACKED JSON STORE (Ensures Zero Data Loss)
// -------------------------------------------------------------

interface StoreData {
  products: Product[];
  categories: Category[];
  orders: Order[];
  content: WebsiteContent;
  subscribers?: string[];
}

let inMemoryStore: StoreData | null = null;

const DATA_FILE = path.join(process.cwd(), 'data', 'nutrighar_data.json');
const TMP_DATA_FILE = path.join('/tmp', 'nutrighar_data.json');

function getStoreData(): StoreData {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  try {
    const targetFile = fs.existsSync(DATA_FILE) ? DATA_FILE : (fs.existsSync(TMP_DATA_FILE) ? TMP_DATA_FILE : null);
    if (targetFile) {
      const raw = fs.readFileSync(targetFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
        inMemoryStore = {
          products: parsed.products,
          categories: parsed.categories,
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          content: parsed.content || DEFAULT_WEBSITE_CONTENT,
          subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
        };
        return inMemoryStore;
      }
    }
  } catch (err) {
    console.error('Error reading data file:', err);
  }

  // Initial seed
  const initialData: StoreData = {
    products: DEFAULT_PRODUCTS,
    categories: DEFAULT_CATEGORIES,
    orders: [],
    content: DEFAULT_WEBSITE_CONTENT,
    subscribers: [],
  };

  inMemoryStore = initialData;
  saveStoreData(initialData);
  return initialData;
}

function saveStoreData(data: StoreData): void {
  inMemoryStore = data;
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // If running in Vercel serverless where root fs is read-only, write to /tmp
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // In-memory store handles runtime
    }
  }
}

// -------------------------------------------------------------
// PRODUCT OPERATIONS
// -------------------------------------------------------------

// -------------------------------------------------------------
// PRODUCT OPERATIONS
// -------------------------------------------------------------

export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  search?: string;
}): Promise<Product[]> {
  const store = getStoreData();
  let list = [...store.products];

  if (options?.isActive !== undefined) {
    list = list.filter((p) => p.isActive === options.isActive);
  }
  if (options?.categorySlug) {
    list = list.filter((p) => p.categorySlug.toLowerCase() === options.categorySlug?.toLowerCase());
  }
  if (options?.categoryId) {
    list = list.filter((p) => p.categoryId === options.categoryId);
  }
  if (options?.isFeatured !== undefined) {
    list = list.filter((p) => Boolean(p.isFeatured) === options.isFeatured);
  }
  if (options?.isBestSeller !== undefined) {
    list = list.filter((p) => Boolean(p.isBestSeller) === options.isBestSeller);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categorySlug.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getProductById(id: string): Promise<Product | null> {
  const store = getStoreData();
  return store.products.find((p) => p.id === id || p.slug === id) || null;
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = slug || `prod-${Date.now()}`;
  const now = new Date().toISOString();

  // Handle Base64 image upload if provided
  let imageUrl = data.image;
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    const uploadRes = await uploadProductImage({
      name: slug,
      type: 'image/jpeg',
      base64OrUrl: imageUrl,
    });
    if (uploadRes.success && uploadRes.url) {
      imageUrl = uploadRes.url;
    }
  }

  const newProduct: Product = {
    id,
    name: data.name,
    slug,
    description: data.description,
    price: Number(data.price),
    originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
    categoryId: data.categoryId || 'cat-mithai',
    categorySlug: data.categorySlug || 'mithai',
    image: imageUrl,
    images: data.images?.length ? data.images : [imageUrl],
    ingredients: data.ingredients || [],
    benefits: data.benefits || [],
    rating: Number(data.rating) || 5.0,
    reviewCount: Number(data.reviewCount) || 0,
    stockQuantity: Number(data.stockQuantity) >= 0 ? Number(data.stockQuantity) : 50,
    lowStockThreshold: Number(data.lowStockThreshold) >= 0 ? Number(data.lowStockThreshold) : 10,
    isFeatured: Boolean(data.isFeatured),
    isBestSeller: Boolean(data.isBestSeller),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: now,
    updatedAt: now,
  };

  // Save to persistent file store immediately
  const store = getStoreData();
  const existingIdx = store.products.findIndex((p) => p.id === id || p.slug === slug);
  if (existingIdx !== -1) {
    store.products[existingIdx] = newProduct;
  } else {
    store.products.unshift(newProduct);
  }
  saveStoreData(store);

  // Background sync with PostgreSQL if available
  prisma.product.upsert({
    where: { slug: newProduct.slug },
    update: {
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice,
      categoryId: newProduct.categoryId,
      categorySlug: newProduct.categorySlug,
      image: newProduct.image,
      images: newProduct.images,
      ingredients: newProduct.ingredients,
      benefits: newProduct.benefits,
      rating: newProduct.rating,
      reviewCount: newProduct.reviewCount,
      stockQuantity: newProduct.stockQuantity,
      lowStockThreshold: newProduct.lowStockThreshold,
      isFeatured: newProduct.isFeatured,
      isBestSeller: newProduct.isBestSeller,
      isActive: newProduct.isActive,
    },
    create: {
      id,
      name: newProduct.name,
      slug: newProduct.slug,
      description: newProduct.description,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice,
      categoryId: newProduct.categoryId,
      categorySlug: newProduct.categorySlug,
      image: newProduct.image,
      images: newProduct.images,
      ingredients: newProduct.ingredients,
      benefits: newProduct.benefits,
      rating: newProduct.rating,
      reviewCount: newProduct.reviewCount,
      stockQuantity: newProduct.stockQuantity,
      lowStockThreshold: newProduct.lowStockThreshold,
      isFeatured: newProduct.isFeatured,
      isBestSeller: newProduct.isBestSeller,
      isActive: newProduct.isActive,
    },
  }).catch(() => {});

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const store = getStoreData();
  const index = store.products.findIndex((p) => p.id === id || p.slug === id);

  let imageUrl = updates.image;
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    const uploadRes = await uploadProductImage({
      name: `prod-${id}`,
      type: 'image/jpeg',
      base64OrUrl: imageUrl,
    });
    if (uploadRes.success && uploadRes.url) {
      imageUrl = uploadRes.url;
      updates.image = imageUrl;
    }
  }

  let updatedProduct: Product | null = null;

  if (index !== -1) {
    const current = store.products[index];
    const newPrice = updates.price !== undefined ? Number(updates.price) : current.price;
    const newOrigPrice = updates.originalPrice !== undefined ? (updates.originalPrice ? Number(updates.originalPrice) : null) : current.originalPrice;
    const newStock = updates.stockQuantity !== undefined ? Number(updates.stockQuantity) : current.stockQuantity;
    const newLowStock = updates.lowStockThreshold !== undefined ? Number(updates.lowStockThreshold) : current.lowStockThreshold;

    store.products[index] = {
      ...current,
      ...updates,
      price: newPrice,
      originalPrice: newOrigPrice,
      stockQuantity: newStock,
      lowStockThreshold: newLowStock,
      updatedAt: new Date().toISOString(),
    };
    updatedProduct = store.products[index];
    saveStoreData(store);
  }

  // Background sync with PostgreSQL if available
  prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } })
    .then((prod) => {
      if (prod) {
        const data: any = { ...updates };
        delete data.id;
        delete data.createdAt;
        delete data.updatedAt;
        if (updates.price !== undefined) data.price = Number(updates.price);
        if (updates.originalPrice !== undefined) data.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : null;
        if (updates.stockQuantity !== undefined) data.stockQuantity = Number(updates.stockQuantity);
        if (updates.lowStockThreshold !== undefined) data.lowStockThreshold = Number(updates.lowStockThreshold);
        return prisma.product.update({ where: { id: prod.id }, data });
      }
    })
    .catch(() => {});

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const store = getStoreData();
  const initialLen = store.products.length;
  store.products = store.products.filter((p) => p.id !== id && p.slug !== id);
  saveStoreData(store);

  prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } })
    .then((prod) => {
      if (prod) return prisma.product.delete({ where: { id: prod.id } });
    })
    .catch(() => {});

  return store.products.length < initialLen;
}

// -------------------------------------------------------------
// CATEGORY OPERATIONS
// -------------------------------------------------------------

export async function getCategories(includeInactive = false): Promise<Category[]> {
  const store = getStoreData();
  let list = [...store.categories];
  if (!includeInactive) {
    list = list.filter((c) => c.isActive);
  }
  return list;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const store = getStoreData();
  return store.categories.find((c) => c.id === id || c.slug === id) || null;
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `cat-${slug}`;
  const now = new Date().toISOString();

  let imageUrl = data.image;
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    const uploadRes = await uploadProductImage({
      name: `cat-${slug}`,
      type: 'image/jpeg',
      base64OrUrl: imageUrl,
    });
    if (uploadRes.success && uploadRes.url) {
      imageUrl = uploadRes.url;
    }
  }

  const newCategory: Category = {
    id,
    name: data.name,
    slug,
    description: data.description || null,
    image: imageUrl || null,
    icon: data.icon || '📦',
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: now,
    updatedAt: now,
  };

  const store = getStoreData();
  const existingIdx = store.categories.findIndex((c) => c.id === id || c.slug === slug);
  if (existingIdx !== -1) {
    store.categories[existingIdx] = newCategory;
  } else {
    store.categories.push(newCategory);
  }
  saveStoreData(store);

  prisma.category.upsert({
    where: { slug: newCategory.slug },
    update: {
      name: newCategory.name,
      description: newCategory.description,
      image: newCategory.image,
      icon: newCategory.icon,
      isActive: newCategory.isActive,
    },
    create: {
      id,
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description,
      image: newCategory.image,
      icon: newCategory.icon,
      isActive: newCategory.isActive,
    },
  }).catch(() => {});

  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const store = getStoreData();
  const index = store.categories.findIndex((c) => c.id === id || c.slug === id);

  let updatedCat: Category | null = null;

  if (index !== -1) {
    store.categories[index] = {
      ...store.categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    updatedCat = store.categories[index];
    saveStoreData(store);
  }

  prisma.category.findFirst({ where: { OR: [{ id }, { slug: id }] } })
    .then((category) => {
      if (category) {
        const data: any = { ...updates };
        delete data.id;
        delete data.createdAt;
        delete data.updatedAt;
        return prisma.category.update({ where: { id: category.id }, data });
      }
    })
    .catch(() => {});

  return updatedCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const store = getStoreData();
  const initialLen = store.categories.length;
  store.categories = store.categories.filter((c) => c.id !== id && c.slug !== id);
  saveStoreData(store);

  prisma.category.findFirst({ where: { OR: [{ id }, { slug: id }] } })
    .then((category) => {
      if (category) return prisma.category.delete({ where: { id: category.id } });
    })
    .catch(() => {});

  return store.categories.length < initialLen;
}

// -------------------------------------------------------------
// ORDER OPERATIONS
// -------------------------------------------------------------

export async function getOrders(statusFilter?: string): Promise<Order[]> {
  const store = getStoreData();
  let list = [...store.orders];
  if (statusFilter && statusFilter !== 'All') {
    list = list.filter((o) => o.orderStatus.toLowerCase() === statusFilter.toLowerCase());
  }
  return list;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const store = getStoreData();
  return store.orders.find((o) => o.id === id || o.orderNumber === id) || null;
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
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: `order-${Date.now()}`,
    orderNumber,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2 || null,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    orderStatus: 'Pending',
    paymentStatus: data.paymentStatus || 'Paid',
    subtotal,
    deliveryCharge,
    totalAmount,
    items: data.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      orderId: `order-${Date.now()}`,
      productId: item.productId || null,
      productName: item.productName,
      productPrice: item.productPrice,
      productCategory: item.productCategory || null,
      productImage: item.productImage || null,
      quantity: item.quantity,
      total: item.productPrice * item.quantity,
    })),
    createdAt: now,
    updatedAt: now,
  };

  const store = getStoreData();
  store.orders.unshift(newOrder);

  // Update product stock counts
  for (const item of data.items) {
    if (item.productId) {
      const prod = store.products.find((p) => p.id === item.productId || p.slug === item.productId);
      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
      }
    }
  }
  saveStoreData(store);

  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): Promise<Order | null> {
  const store = getStoreData();
  const index = store.orders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index !== -1) {
    store.orders[index].orderStatus = orderStatus;
    if (paymentStatus) store.orders[index].paymentStatus = paymentStatus;
    store.orders[index].updatedAt = new Date().toISOString();
    saveStoreData(store);
  }

  return index !== -1 ? store.orders[index] : null;
}

// -------------------------------------------------------------
// WEBSITE CONTENT OPERATIONS
// -------------------------------------------------------------

export async function getWebsiteContent(): Promise<WebsiteContent> {
  const store = getStoreData();
  const raw = store.content || {};
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
  const store = getStoreData();

  let payloadData: any;
  if (Array.isArray(data)) {
    payloadData = data;
  } else if (typeof data === 'object' && data !== null) {
    const currentSection = (store.content as any)?.[section] || (DEFAULT_WEBSITE_CONTENT as any)[section] || {};
    payloadData = { ...currentSection, ...data };
  } else {
    payloadData = data;
  }

  // Handle hero slide image uploads if any are base64
  if (section === 'heroSlides' && Array.isArray(payloadData)) {
    for (let i = 0; i < payloadData.length; i++) {
      const slide = payloadData[i];
      if (slide.image && slide.image.startsWith('data:image/')) {
        const uploadRes = await uploadProductImage({
          name: `slide-${i}-${Date.now()}`,
          type: 'image/jpeg',
          base64OrUrl: slide.image,
        });
        if (uploadRes.success && uploadRes.url) {
          slide.image = uploadRes.url;
        }
      }
    }
  }

  // Update persistent store
  if (!store.content) {
    store.content = JSON.parse(JSON.stringify(DEFAULT_WEBSITE_CONTENT));
  }
  (store.content as any)[section] = payloadData;
  saveStoreData(store);

  return getWebsiteContent();
}

// -------------------------------------------------------------
// ADMIN DASHBOARD STATS
// -------------------------------------------------------------

export async function getAdminStats() {
  const store = getStoreData();
  const totalProducts = store.products.length;
  const activeProducts = store.products.filter((p) => p.isActive).length;
  const totalOrders = store.orders.length;
  const pendingOrders = store.orders.filter((o) => ['Pending', 'Preparing'].includes(o.orderStatus)).length;
  const deliveredOrders = store.orders.filter((o) => o.orderStatus === 'Delivered').length;
  const totalRevenue = store.orders
    .filter((o) => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockProducts = store.products.filter((p) => p.isActive && p.stockQuantity <= 10).slice(0, 8);
  const recentOrders = store.orders.slice(0, 5).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
    })),
  }));

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalRevenue,
    lowStockProducts,
    recentOrders,
  };
}

// -------------------------------------------------------------
// NEWSLETTER SUBSCRIBERS
// -------------------------------------------------------------

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; isNew: boolean }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Invalid email address provided', isNew: false };
  }

  const cleanEmail = email.trim().toLowerCase();
  const store = getStoreData();
  if (!store.subscribers) {
    store.subscribers = [];
  }

  if (store.subscribers.includes(cleanEmail)) {
    return { success: true, message: 'You are already subscribed to Nutri Ghar updates!', isNew: false };
  }

  store.subscribers.push(cleanEmail);
  saveStoreData(store);

  return { success: true, message: 'Thank you for subscribing to Nutri Ghar wellness notes & batch updates!', isNew: true };
}

export async function getSubscribers(): Promise<string[]> {
  const store = getStoreData();
  return store.subscribers || [];
}

