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

export const DEFAULT_HERO_SLIDES: HeroSlideContent[] = [
  {
    id: 'protein-nutrition',
    tag: 'CLEAN FITNESS NUTRITION',
    title: 'Clean Protein Nutrition Banner',
    titleItalic: '',
    subtitle: '',
    buttonText: 'Shop High Protein',
    buttonLink: '/products?category=protein-nutrition',
    image: '/images/clean-protein-pouch-banner.jpg',
  },
  {
    id: 'dry-fruits-nuts',
    tag: 'HANDPICKED SUPERFOODS',
    title: 'Slow-Roasted Dry Fruits & Nuts Banner',
    titleItalic: '',
    subtitle: '',
    buttonText: 'Explore Roasted Nuts',
    buttonLink: '/products?category=healthy-snacks',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1400&auto=format&fit=crop&q=85',
  },
  {
    id: 'mithai-ladoos',
    tag: 'HERITAGE RECIPES',
    title: 'Pure A2 Desi Ghee Mithai & Ladoos Banner',
    titleItalic: '',
    subtitle: '',
    buttonText: 'Shop Mithai & Ladoos',
    buttonLink: '/products?category=mithai',
    image: '/images/dry-fruit-ladoos-banner.jpg',
  },
  {
    id: 'peanut-butter',
    tag: '100% NATURAL BUTTER',
    title: 'Stone-Ground Peanut Butter Banner',
    titleItalic: '',
    subtitle: '',
    buttonText: 'Discover Butters',
    buttonLink: '/products?category=peanut-butter',
    image: '/images/peanut-butter-banner.jpg',
  },
  {
    id: 'nut-cake-cookies',
    tag: 'HEALTHY BAKERY CRAFT',
    title: 'Wholesome Nut Cakes & Cookies Banner',
    titleItalic: '',
    subtitle: '',
    buttonText: 'Explore Healthy Treats',
    buttonLink: '/products?category=healthy-snacks',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1400&auto=format&fit=crop&q=85',
  },
];

export const DEFAULT_WEBSITE_CONTENT: WebsiteContent = {
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
    phone: '+91 79761 19153',
    email: 'Nutrighar2917@gmail.com',
    whatsapp: '+91 79761 19153',
    address: 'Nutri Ghar Artisanal Kitchen, Sector 14, Gurugram, Haryana - 122001',
    fssaiLicense: 'FSSAI Lic: 10823005000214',
  },
  footer: {
    aboutText: 'Nutri Ghar represents healthy food made with the warmth and trust of home. Small batches crafted with pure ingredients, zero chemical preservatives, and traditional recipes.',
    instagramUrl: 'https://instagram.com',
    whatsappUrl: 'https://wa.me/917976119153',
    facebookUrl: 'https://facebook.com',
    copyrightText: `© ${new Date().getFullYear()} Nutri Ghar. Pure homemade nutrition crafted with care.`,
  },
  newsletter: {
    heading: 'A Little Goodness in Your Inbox.',
    description: 'Receive thoughtful wellness notes, seasonal kitchen recipes, and priority access to fresh batches.',
    promoNote: 'We respect your privacy. No spam, ever. Unsubscribe anytime.',
  },
};
