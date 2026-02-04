import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";

export interface Product {
  id?: number | undefined;
  data?: any;
}
export interface ProductQueryOptions extends QueryOptions {
  sort?: string;
  min_price?: number;
  max_price?: number;
  availability?: string;
  per_page?: string;
  type?: any;
  category_id?: any;
  brand_id?: any;
  min_rating?: any;
  is_featured?: boolean;
  best_selling?: boolean;
  popular_products?: boolean;
  flash_sale?: boolean;
  flash_sale_id?: number;
  store_id?: any;
}

export interface CustomerList {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}

export interface CoupponCheck {
  coupon_code: string;
}
export interface Invoice {
  order_id?: any;
  store_id?: any;
}

export interface CategoryQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  pagination?:boolean
  per_page?:any
  list?:boolean
}

export interface Category {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }
