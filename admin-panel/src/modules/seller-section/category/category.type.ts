import { type QueryOptions } from "@/types";

export interface CategoryQueryOptions extends QueryOptions {
  store_id?: any;
  sortField?: string;
  sort?: string;
}

export interface SellerCategory {
  id: string;
  category_name: string;
  category_slug: string;
  status: number;
  store_id: string | null;
  parent_id: string | null;
  type: string;
  category_thumb: string | null;
}
