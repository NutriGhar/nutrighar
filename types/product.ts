export interface Product {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  categoryId?: string;
  categorySlug?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  rating: number;
  reviews?: number;
  reviewCount?: number;
  ingredients?: string[];
  benefits?: string[];
  featured?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderNumber: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Testimonial {
  name: string;
  rating: number;
  review: string;
  product: string;
}

export interface ShopByGoal {
  title: string;
  description: string;
  icon: string;
  category: string;
}

