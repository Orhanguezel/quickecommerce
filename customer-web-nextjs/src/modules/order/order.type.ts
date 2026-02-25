// --- Order List Item ---
export interface OrderStoreDetails {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  logo_url?: string;
}

export interface OrderDetail {
  id: number;
  order_id: number;
  store_id: number;
  product_id: number;
  product_name: string;
  product_image_url: string;
  product_sku: string;
  variant_details: Record<string, string> | null;
  base_price: number;
  price: number;
  quantity: number;
  line_total_price_with_qty: number;
  coupon_discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_tax_amount: number;
  line_total_price: number;
  review_status: boolean;
}

export interface OrderMaster {
  id: number;
  customer_id: number;
  shipping_address_id: number;
  shipping_address: {
    house?: string;
    road?: string;
    floor?: string;
    address?: string;
    postal_code?: string;
    contact?: string;
  } | null;
  delivery_charge: number;
  product_discount_amount: number;
  order_amount: number;
  shipping_charge: number;
  paid_amount: number;
  payment_gateway: string;
  payment_status: "pending" | "paid" | "failed";
  transaction_ref: string | null;
  order_notes: string | null;
  currency_code: string;
  exchange_rate: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "pickup"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "on_hold";

export type RefundStatus =
  | "requested"
  | "processing"
  | "refunded"
  | "rejected"
  | null;

export interface Order {
  order_id: number;
  store: string;
  customer_name: string;
  invoice_number: string;
  order_date: string;
  invoice_date: string;
  order_type: "regular" | "pos";
  delivery_option: "home_delivery" | "parcel" | "takeaway" | "in_store";
  delivery_type: "standard" | "express" | "freight" | "immediate";
  delivery_time: string | null;
  order_amount: number;
  product_discount_amount: number;
  shipping_charge: number;
  additional_charge_name: string | null;
  additional_charge_amount: number;
  is_reviewed: boolean;
  payment_status: string;
  status: OrderStatus;
  refund_status: RefundStatus;
  store_details: OrderStoreDetails;
  order_master: OrderMaster;
  order_details: OrderDetail[];
}

// --- Order Detail Response ---
export interface OrderSummary {
  subtotal: number;
  coupon_discount: number;
  tax_rate: number;
  total_tax_amount: number;
  tax_included_in_price: boolean;
  product_discount_amount: number;
  shipping_charge: number;
  additional_charge: number;
  total_amount: number;
}

export interface OrderTracking {
  status: string;
  label: string;
  description: string;
  timestamp: string | null;
  is_current: boolean;
}

export interface OrderRefund {
  id: number;
  order_id: number;
  reason: string;
  customer_note: string | null;
  status: RefundStatus;
  admin_note: string | null;
  refund_amount: number | null;
  created_at: string;
}

export interface OrderDetailResponse {
  order_data: Order;
  order_summary: OrderSummary;
  refund: OrderRefund | null;
  order_tracking: OrderTracking[];
  order_payment_tracking: OrderTracking[];
  order_refund_tracking: OrderTracking[];
}

// --- Order List Response ---
export interface OrderListResponse {
  message: string;
  data: Order[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}
