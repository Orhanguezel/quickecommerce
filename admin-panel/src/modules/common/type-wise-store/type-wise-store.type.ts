

import {
  type QueryOptions,
} from "@/types";

export interface TypeWiseStoreQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  store_type?: string;
}


export interface TypeWiseStore {
    id: string;
    name: string;
    slug: string;
  }