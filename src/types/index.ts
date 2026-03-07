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
  // Shipping dimensions (for Shiprocket)
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
  // Joined data
  images?: ProductImage[];
  variants?: ProductVariant[];
  avg_rating?: number;
  review_count?: number;
}

export interface ProductVariant {
  id: string;
  parent_product_id: string;
  variant_name: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
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
  // Shiprocket fields
  shiprocket_order_id?: string | null;
  shipment_id?: string | null;
  awb_code?: string | null;
  estimated_delivery?: string | null;
  courier_name?: string | null;
  // Joined data
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

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned' | 'Awaiting Payment';

export interface CartItem {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  image: string;
}

// Shiprocket-specific types

export interface Shipment {
  id: string;
  order_id: string;
  shiprocket_order_id: string | null;
  shipment_id: string | null;
  courier_name: string | null;
  awb_code: string | null;
  status: string;
  estimated_delivery: string | null;
  pickup_date: string | null;
  delivered_date: string | null;
  shipping_cost: number;
  created_at: string;
  updated_at: string;
}

export interface TrackingUpdate {
  id: string;
  shipment_id: string;
  order_id: string;
  status: string;
  activity: string | null;
  location: string | null;
  sr_status: string | null;
  sr_status_label: string | null;
  event_time: string;
  created_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string | null;
  reason: string;
  refund_method: string;
  refund_details: any;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  admin_notes: string | null;
  shiprocket_return_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CancellationRequest {
  id: string;
  order_id: string;
  user_id: string | null;
  reason: string;
  refund_method: string;
  refund_details: any;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Refunded';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
