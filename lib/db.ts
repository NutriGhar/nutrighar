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
// PRODUCT OPERATIONS (POSTGRESQL via PRISMA)
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

    return products.map(formatProduct);
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });
    return product ? formatProduct(product) : null;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = slug || `prod-${Date.now()}`;

  const created = await prisma.product.create({
    data: {
      id,
      name: data.name,
      slug,
      description: data.description,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      categoryId: data.categoryId,
      categorySlug: data.categorySlug,
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
    },
  });

  return formatProduct(created);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!product) return null;

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
  } catch (error) {
    console.error('Error in updateProduct:', error);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!product) return false;

    await prisma.product.delete({
      where: { id: product.id },
    });
    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return false;
  }
}

// -------------------------------------------------------------
// CATEGORY OPERATIONS (POSTGRESQL via PRISMA)
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
    return categories.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!category) return null;
    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    return null;
  }
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `cat-${slug}`;

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
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  try {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!category) return null;

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
  } catch (error) {
    console.error('Error in updateCategory:', error);
    return null;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!category) return false;

    await prisma.category.delete({
      where: { id: category.id },
    });
    return true;
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return false;
  }
}

// -------------------------------------------------------------
// ORDER OPERATIONS (POSTGRESQL via PRISMA)
// -------------------------------------------------------------

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
  } catch (error) {
    console.error('Error in getOrders:', error);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const o = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });
    if (!o) return null;

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
  } catch (error) {
    console.error('Error in getOrderById:', error);
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

  // Transaction: Create Order + OrderItems + Decrement Stock
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

    // Decrement stock for purchased products
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
}

export async function updateOrderStatus(
  id: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): Promise<Order | null> {
  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });
    if (!order) return null;

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
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return null;
  }
}

// -------------------------------------------------------------
// WEBSITE CONTENT OPERATIONS (POSTGRESQL via PRISMA)
// -------------------------------------------------------------

export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const rows = await prisma.websiteContent.findMany();
    const result = { ...DEFAULT_WEBSITE_CONTENT };

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
  } catch (error) {
    console.error('Error in getWebsiteContent:', error);
    return DEFAULT_WEBSITE_CONTENT;
  }
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

  await prisma.websiteContent.upsert({
    where: { section: sectionStr },
    update: { data: payloadData },
    create: {
      id: `content-${sectionStr}`,
      section: sectionStr,
      data: payloadData,
    },
  });

  return getWebsiteContent();
}

// -------------------------------------------------------------
// ADMIN DASHBOARD STATS (POSTGRESQL via PRISMA)
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
    console.error('Error in getAdminStats:', error);
    return {
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0,
      lowStockProducts: [],
      recentOrders: [],
    };
  }
}
