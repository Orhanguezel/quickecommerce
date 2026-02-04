

import {
  type QueryOptions,
} from "@/types";

export interface ProductAttributeQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
}


export interface productAttribute {
    id: string;
    name: string;
    slug: string;
  }