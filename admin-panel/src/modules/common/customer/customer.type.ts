

import {
  type QueryOptions,
} from "@/types";

export interface CustomerQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Customer {
    id: string;
    name: string;
    slug: string;
  }