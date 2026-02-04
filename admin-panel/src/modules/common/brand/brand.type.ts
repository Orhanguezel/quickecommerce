

import {
  type QueryOptions,
} from "@/types";

export interface BrandQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Brand {
    id: string;
    name: string;
    slug: string;
  }