

import {
  type QueryOptions,
} from "@/types";

export interface InventoryQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  brand_id?: string;
  category_id?: string;
  stock_status?: string;
  store_id?: any;
  per_page?: any;
  type?: string;
}


export interface Inventory {
    id: string;
    name: string;
    slug: string;
  }