export interface CustomerAddress {
  id: number;
  title: string | null;
  type: "home" | "office" | "others";
  email: string;
  contact_number: string;
  address: string;
  lat: number | null;
  long: number | null;
  area: string | null;
  road: string | null;
  house: string | null;
  floor: string | null;
  postal_code: string | null;
  is_default: boolean;
  status: number;
}

export interface AddressInput {
  id?: number;
  title?: string;
  type: "home" | "office" | "others";
  email: string;
  contact_number: string;
  address: string;
  area_id?: number;
  road?: string;
  house?: string;
  floor?: string;
  postal_code?: string;
  is_default?: boolean;
  status: number;
}

export interface CouponCheckInput {
  coupon_code: string;
  currency_code: string;
  sub_total: number;
}

export interface CouponCheckResponse {
  message: string;
  coupon: {
    title: string;
    discount_amount: number;
    max_discount: number;
    min_order_value: number;
    discount_type: "percentage" | "amount";
    code: string;
    discounted_amount: number;
    final_amount: number;
  };
}

export interface CheckoutPackageItem {
  product_id: number;
  variant_id: number;
  quantity: number;
  product_campaign_id?: number;
  admin_discount_type?: string;
  admin_discount_rate?: number;
  admin_discount_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  line_total_price?: number;
}

export interface CheckoutPackage {
  store_id: number;
  delivery_option: "home_delivery" | "parcel" | "takeaway";
  delivery_type?: "standard" | "express" | "freight";
  items: CheckoutPackageItem[];
  shipping_charge?: number;
  additional_charge?: number;
}

export interface PaymentGateway {
  id: number;
  value: string;
  label: string;
  name: string;
  slug: string;
  image: string | null;
  image_url: string | null;
  description: string | null;
}

export interface PlaceOrderInput {
  shipping_address_id?: number;
  currency_code: string;
  payment_gateway: string;
  order_notes?: string;
  order_amount?: number;
  coupon_code?: string;
  coupon_title?: string;
  coupon_discount_amount_admin?: number;
  shipping_charge?: number;
  packages: CheckoutPackage[];
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  orders: {
    order_id: number;
    invoice_number: string;
    order_amount: number;
    status: string;
  }[];
  order_master: {
    id: number;
    payment_gateway: string;
    payment_status: string;
    order_notes: string | null;
  };
}

export interface CreateGatewaySessionResponse {
  success: boolean;
  message: string;
  data?: {
    checkout_url?: string;
    token?: string;
    order_master_id?: number;
  };
}
