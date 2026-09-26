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
