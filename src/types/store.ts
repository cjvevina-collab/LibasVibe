export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'COD' | 'Easypaisa' | 'BankTransfer' | 'WhatsApp';

export interface BannerSlide {
  id: string;
  kicker: string;
  headline: string;
  subtitle: string;
  buttonLabel: string;
  buttonLink: string;
  imageUrl: string;
  mobileFocus?: 'left' | 'center' | 'right';
  active: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  sku?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  fabric?: string;
  imageUrl: string;
  images?: string[];
  sizes: ProductSize[];
  inStock: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  size: ProductSize;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  size: ProductSize;
  quantity: number;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}
