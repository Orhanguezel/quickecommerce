

import {
  type QueryOptions,
} from "@/types";

export interface SellerStoreQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  seller_id?: string;
}


export interface SellerStore {
    id: string;
    name: string;
    slug: string;
  }