// AdvayDecor TypeScript Interfaces

export interface Profile {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'customer';
  full_name: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  base_price: number;
  category: string;
  has_variants: boolean;
  is_active: boolean;
  created_at: string;
  // Joined data
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  parent_product_id: string;
  variant_name: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  created_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  image_url: string;
  display_order: number;
}

export interface SiteConfig {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export interface Order {
  id: string;
  user_id: string | null;
  guest_info: GuestInfo | null;
  status: OrderStatus;
  total_amount: number;
  shipping_fee: number;
  shipping_address: ShippingAddress;
  payment_method: 'COD' | 'Razorpay';
  payment_id: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_title: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  email?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';

export interface CartItem {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  image: string;
}
