

import {
  type QueryOptions,
} from "@/types";

export interface StoreTypeQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  merchant_id?: string;
}


export interface StoreType {
    id: string;
    name: string;
    slug: string;
  }