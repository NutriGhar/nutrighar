// Central Database & Data Access Service Layer for Nutri Ghar
// Directly queries local PostgreSQL database via Prisma ORM with fallback support

import prisma from '@/lib/prisma';

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
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85',
    badgeText: '12g Protein / Piece',
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
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1400&auto=format&fit=crop&q=85',
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
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=1400&auto=format&fit=crop&q=85',
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
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
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
    description: 'Enriched whey and superfood blends crafted for daily vitality and fitness recovery.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'],
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
    name: 'Clean Whey Protein Concentrate',
    slug: 'whey-protein-isolate',
    categoryId: 'cat-protein-nutrition',
    categorySlug: 'protein-nutrition',
    price: 1899,
    originalPrice: 2199,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'],
    description: 'Grass-fed hormone-free clean whey protein with digestive enzymes.',
    ingredients: ['Grass-Fed Whey Protein Concentrate', 'Cocoa Powder', 'Digestive Enzymes', 'Stevia Leaf Extract'],
    benefits: ['24g Protein per Scoop', '5.5g BCAAs', 'Zero Artificial Sweeteners', 'Easy Digestion'],
    rating: 4.8,
    reviewCount: 167,
    stockQuantity: 25,
    lowStockThreshold: 5,
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

let inMemoryCategories: Category[] = [...DEFAULT_CATEGORIES];
let inMemoryProducts: Product[] = [...DEFAULT_PRODUCTS];

// -------------------------------------------------------------
// PRODUCT OPERATIONS (POSTGRESQL via PRISMA with IN-MEMORY FALLBACK)
// -------------------------------------------------------------

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
    if (options?.categorySlug) {
      where.categorySlug = options.categorySlug;
    }
    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }
    if (options?.isFeatured !== undefined) {
      where.isFeatured = options.isFeatured;
    }
    if (options?.isBestSeller !== undefined) {
      where.isBestSeller = options.isBestSeller;
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
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    if (products && products.length > 0) {
      return products.map(formatProduct);
    }
  } catch (error) {
    console.error('Warning: PostgreSQL getProducts failed, falling back to in-memory store:', error);
  }

  // In-memory fallback
  let list = [...inMemoryProducts];
  if (options?.isActive !== undefined) {
    list = list.filter((p) => p.isActive === options.isActive);
  }
  if (options?.categorySlug) {
    list = list.filter((p) => p.categorySlug === options.categorySlug);
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
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });
    if (product) return formatProduct(product);
  } catch (error) {
    console.error('Warning: PostgreSQL getProductById failed, falling back to in-memory store:', error);
  }

  return inMemoryProducts.find((p) => p.id === id || p.slug === id) || null;
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = slug || `prod-${Date.now()}`;
  const now = new Date().toISOString();

  const newProduct: Product = {
    id,
    name: data.name,
    slug,
    description: data.description,
    price: Number(data.price),
    originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
    categoryId: data.categoryId || 'cat-mithai',
    categorySlug: data.categorySlug || 'mithai',
    image: data.image,
    images: data.images || [data.image],
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

  // Add to in-memory store
  inMemoryProducts.unshift(newProduct);

  try {
    const created = await prisma.product.create({
      data: {
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
    });
    return formatProduct(created);
  } catch (error) {
    console.error('Warning: PostgreSQL createProduct failed, stored in in-memory fallback:', error);
  }

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const index = inMemoryProducts.findIndex((p) => p.id === id || p.slug === id);
  if (index !== -1) {
    inMemoryProducts[index] = {
      ...inMemoryProducts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (product) {
      const data: any = { ...updates };
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;

      if (updates.price !== undefined) data.price = Number(updates.price);
      if (updates.originalPrice !== undefined) data.originalPrice = updates.originalPrice ? Number(updates.originalPrice) : null;
      if (updates.stockQuantity !== undefined) data.stockQuantity = Number(updates.stockQuantity);
      if (updates.lowStockThreshold !== undefined) data.lowStockThreshold = Number(updates.lowStockThreshold);

      const updated = await prisma.product.update({
        where: { id: product.id },
        data,
      });

      return formatProduct(updated);
    }
  } catch (error) {
    console.error('Warning: PostgreSQL updateProduct failed, updated in in-memory fallback:', error);
  }

  return index !== -1 ? inMemoryProducts[index] : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const initialLen = inMemoryProducts.length;
  inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id && p.slug !== id);

  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (product) {
      await prisma.product.delete({
        where: { id: product.id },
      });
      return true;
    }
  } catch (error) {
    console.error('Warning: PostgreSQL deleteProduct failed, deleted in in-memory fallback:', error);
  }

  return inMemoryProducts.length < initialLen;
}

// -------------------------------------------------------------
// CATEGORY OPERATIONS (POSTGRESQL via PRISMA with IN-MEMORY FALLBACK)
// -------------------------------------------------------------

export async function getCategories(includeInactive = false): Promise<Category[]> {
  try {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    if (categories && categories.length > 0) {
      return categories.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));
    }
  } catch (error) {
    console.error('Warning: PostgreSQL getCategories failed, falling back to in-memory store:', error);
  }

  let list = [...inMemoryCategories];
  if (!includeInactive) {
    list = list.filter((c) => c.isActive);
  }
  return list;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (category) {
      return {
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      };
    }
  } catch (error) {
    console.error('Warning: PostgreSQL getCategoryById failed, falling back to in-memory store:', error);
  }

  return inMemoryCategories.find((c) => c.id === id || c.slug === id) || null;
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `cat-${slug}`;
  const now = new Date().toISOString();

  const newCategory: Category = {
    id,
    name: data.name,
    slug,
    description: data.description || null,
    image: data.image || null,
    icon: data.icon || '📦',
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryCategories.push(newCategory);

  try {
    const created = await prisma.category.create({
      data: {
        id,
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        icon: data.icon || '📦',
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    return {
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Warning: PostgreSQL createCategory failed, stored in in-memory fallback:', error);
  }

  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const index = inMemoryCategories.findIndex((c) => c.id === id || c.slug === id);
  if (index !== -1) {
    inMemoryCategories[index] = {
      ...inMemoryCategories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (category) {
      const data: any = { ...updates };
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;

      const updated = await prisma.category.update({
        where: { id: category.id },
        data,
      });

      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    }
  } catch (error) {
    console.error('Warning: PostgreSQL updateCategory failed, updated in in-memory fallback:', error);
  }

  return index !== -1 ? inMemoryCategories[index] : null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const initialLen = inMemoryCategories.length;
  inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id && c.slug !== id);

  try {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (category) {
      await prisma.category.delete({
        where: { id: category.id },
      });
      return true;
    }
  } catch (error) {
    console.error('Warning: PostgreSQL deleteCategory failed, deleted in in-memory fallback:', error);
  }

  return inMemoryCategories.length < initialLen;
}

// -------------------------------------------------------------
// ORDER OPERATIONS (POSTGRESQL via PRISMA with IN-MEMORY FALLBACK)
// -------------------------------------------------------------

let inMemoryOrders: Order[] = [];

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

    if (orders && orders.length > 0) {
      return orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        addressLine1: o.addressLine1,
        addressLine2: o.addressLine2,
        city: o.city,
        state: o.state,
        postalCode: o.postalCode,
        orderStatus: o.orderStatus as any,
        paymentStatus: o.paymentStatus as any,
        subtotal: o.subtotal,
        deliveryCharge: o.deliveryCharge,
        totalAmount: o.totalAmount,
        customerId: o.customerId,
        items: o.items.map((i) => ({
          id: i.id,
          orderId: i.orderId,
          productId: i.productId,
          productName: i.productName,
          productPrice: i.productPrice,
          productCategory: i.productCategory,
          productImage: i.productImage,
          quantity: i.quantity,
          total: i.total,
        })),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));
    }
  } catch (error) {
    console.error('Warning: PostgreSQL getOrders failed, falling back to in-memory store:', error);
  }

  let list = [...inMemoryOrders];
  if (statusFilter && statusFilter !== 'All') {
    list = list.filter((o) => o.orderStatus.toLowerCase() === statusFilter.toLowerCase());
  }
  return list;
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const o = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });
    if (o) {
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        addressLine1: o.addressLine1,
        addressLine2: o.addressLine2,
        city: o.city,
        state: o.state,
        postalCode: o.postalCode,
        orderStatus: o.orderStatus as any,
        paymentStatus: o.paymentStatus as any,
        subtotal: o.subtotal,
        deliveryCharge: o.deliveryCharge,
        totalAmount: o.totalAmount,
        customerId: o.customerId,
        items: o.items.map((i) => ({
          id: i.id,
          orderId: i.orderId,
          productId: i.productId,
          productName: i.productName,
          productPrice: i.productPrice,
          productCategory: i.productCategory,
          productImage: i.productImage,
          quantity: i.quantity,
          total: i.total,
        })),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      };
    }
  } catch (error) {
    console.error('Warning: PostgreSQL getOrderById failed, falling back to in-memory store:', error);
  }

  return inMemoryOrders.find((o) => o.id === id || o.orderNumber === id) || null;
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

  const inMemOrder: Order = {
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

  inMemoryOrders.unshift(inMemOrder);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
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
          items: {
            create: data.items.map((item) => ({
              productId: item.productId || null,
              productName: item.productName,
              productPrice: item.productPrice,
              productCategory: item.productCategory || null,
              productImage: item.productImage || null,
              quantity: item.quantity,
              total: item.productPrice * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of data.items) {
        if (item.productId) {
          const prod = await tx.product.findFirst({
            where: { OR: [{ id: item.productId }, { slug: item.productId }] },
          });
          if (prod) {
            await tx.product.update({
              where: { id: prod.id },
              data: { stockQuantity: Math.max(0, prod.stockQuantity - item.quantity) },
            });
          }
        }
      }

      return createdOrder;
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      city: order.city,
      state: order.state,
      postalCode: order.postalCode,
      orderStatus: order.orderStatus as any,
      paymentStatus: order.paymentStatus as any,
      subtotal: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      totalAmount: order.totalAmount,
      customerId: order.customerId,
      items: order.items.map((i) => ({
        id: i.id,
        orderId: i.orderId,
        productId: i.productId,
        productName: i.productName,
        productPrice: i.productPrice,
        productCategory: i.productCategory,
        productImage: i.productImage,
        quantity: i.quantity,
        total: i.total,
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Warning: PostgreSQL createOrder failed, stored in in-memory fallback:', error);
  }

  return inMemOrder;
}

export async function updateOrderStatus(
  id: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): Promise<Order | null> {
  const index = inMemoryOrders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index !== -1) {
    inMemoryOrders[index].orderStatus = orderStatus;
    if (paymentStatus) inMemoryOrders[index].paymentStatus = paymentStatus;
    inMemoryOrders[index].updatedAt = new Date().toISOString();
  }

  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });
    if (order) {
      const data: any = { orderStatus };
      if (paymentStatus) data.paymentStatus = paymentStatus;

      const updated = await prisma.order.update({
        where: { id: order.id },
        data,
        include: { items: true },
      });

      return {
        id: updated.id,
        orderNumber: updated.orderNumber,
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        customerPhone: updated.customerPhone,
        addressLine1: updated.addressLine1,
        addressLine2: updated.addressLine2,
        city: updated.city,
        state: updated.state,
        postalCode: updated.postalCode,
        orderStatus: updated.orderStatus as any,
        paymentStatus: updated.paymentStatus as any,
        subtotal: updated.subtotal,
        deliveryCharge: updated.deliveryCharge,
        totalAmount: updated.totalAmount,
        customerId: updated.customerId,
        items: updated.items.map((i) => ({
          id: i.id,
          orderId: i.orderId,
          productId: i.productId,
          productName: i.productName,
          productPrice: i.productPrice,
          productCategory: i.productCategory,
          productImage: i.productImage,
          quantity: i.quantity,
          total: i.total,
        })),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    }
  } catch (error) {
    console.error('Warning: PostgreSQL updateOrderStatus failed, updated in in-memory fallback:', error);
  }

  return index !== -1 ? inMemoryOrders[index] : null;
}

// -------------------------------------------------------------
// WEBSITE CONTENT OPERATIONS (POSTGRESQL via PRISMA with IN-MEMORY FALLBACK)
// -------------------------------------------------------------

export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const rows = await prisma.websiteContent.findMany();
    const result = { ...DEFAULT_WEBSITE_CONTENT };

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.section in result && row.data !== undefined && row.data !== null) {
          if (Array.isArray(row.data)) {
            (result as any)[row.section] = row.data;
          } else if (typeof row.data === 'object') {
            (result as any)[row.section] = {
              ...(result as any)[row.section],
              ...(row.data as any),
            };
          } else {
            (result as any)[row.section] = row.data;
          }
        }
      }
      return result;
    }
  } catch (error) {
    console.error('Warning: PostgreSQL getWebsiteContent failed, falling back to in-memory store:', error);
  }

  return DEFAULT_WEBSITE_CONTENT;
}

export async function updateWebsiteContent(section: keyof WebsiteContent, data: any): Promise<WebsiteContent> {
  const sectionStr = String(section);
  let payloadData: any;

  if (Array.isArray(data)) {
    payloadData = data;
  } else if (typeof data === 'object' && data !== null) {
    const currentSection = (DEFAULT_WEBSITE_CONTENT as any)[section] || {};
    payloadData = { ...currentSection, ...data };
  } else {
    payloadData = data;
  }

  // Update in-memory fallback
  (DEFAULT_WEBSITE_CONTENT as any)[section] = payloadData;

  try {
    await prisma.websiteContent.upsert({
      where: { section: sectionStr },
      update: { data: payloadData },
      create: {
        id: `content-${sectionStr}`,
        section: sectionStr,
        data: payloadData,
      },
    });
  } catch (error) {
    console.error(`Warning: Failed to persist content section '${sectionStr}' to PostgreSQL (check DATABASE_URL):`, error);
  }

  return getWebsiteContent();
}

// -------------------------------------------------------------
// ADMIN DASHBOARD STATS (POSTGRESQL via PRISMA with IN-MEMORY FALLBACK)
// -------------------------------------------------------------

export async function getAdminStats() {
  try {
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      paidOrders,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: { in: ['Pending', 'Preparing'] } } }),
      prisma.order.count({ where: { orderStatus: 'Delivered' } }),
      prisma.order.findMany({
        where: { OR: [{ paymentStatus: 'Paid' }, { orderStatus: 'Delivered' }] },
        select: { totalAmount: true },
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          stockQuantity: { lte: 10 },
        },
        take: 8,
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
      lowStockProducts: lowStockProducts.map(formatProduct),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
        })),
      })),
    };
  } catch (error) {
    console.error('Warning: PostgreSQL getAdminStats failed, computing from in-memory fallback:', error);
  }

  // Fallback stats computation
  const totalProducts = inMemoryProducts.length;
  const activeProducts = inMemoryProducts.filter((p) => p.isActive).length;
  const totalOrders = inMemoryOrders.length;
  const pendingOrders = inMemoryOrders.filter((o) => ['Pending', 'Preparing'].includes(o.orderStatus)).length;
  const deliveredOrders = inMemoryOrders.filter((o) => o.orderStatus === 'Delivered').length;
  const totalRevenue = inMemoryOrders
    .filter((o) => o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockProducts = inMemoryProducts.filter((p) => p.isActive && p.stockQuantity <= 10).slice(0, 8);
  const recentOrders = inMemoryOrders.slice(0, 5).map((o) => ({
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
