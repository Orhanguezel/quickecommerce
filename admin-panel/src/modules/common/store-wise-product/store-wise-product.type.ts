

import {
  type QueryOptions,
} from "@/types";

export interface StoreWiseProductQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  store_id?: string;
}


export interface StoreWiseProduct {
    id: string;
    name: string;
    slug: string;
  }