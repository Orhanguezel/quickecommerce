import type { Product } from "@/modules/product/product.type";

export interface Store {
  id: number;
  area: string | null;
  seller: string | null;
  store_type: string | null;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  logo_url: string | null;
  banner: string | null;
  banner_url: string | null;
  address: string | null;
  is_featured: number;
  opening_time: string | null;
  closing_time: string | null;
  veg_status: number;
  off_day: string | null;
  rating: number;
}

export interface StoreSeller {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface StoreDetail {
  id: number;
  area: string | null;
  area_id: number | null;
  seller: StoreSeller | null;
  store_type: string | null;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  description: string | null;
  logo: string | null;
  tax: number | null;
  tax_number: string | null;
  business_plan: string | null;
  delivery_time: number | null;
  logo_url: string | null;
  banner: string | null;
  banner_url: string | null;
  address: string | null;
  is_featured: number;
  opening_time: string | null;
  closing_time: string | null;
  started_from: string | null;
  veg_status: number;
  off_day: string | null;
  rating: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_image_url: string | null;
  additional_charge_name: string | null;
  additional_charge_amount: number;
  additional_charge_type: string;
  total_product: number;
  all_products: Product[];
  featured_products: Product[];
}

export interface StoreType {
  id: number;
  value: string;
  label: string;
  name: string;
  image_url: string | null;
}
