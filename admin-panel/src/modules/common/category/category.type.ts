

import {
  type QueryOptions,
} from "@/types";

export interface CategoryQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  pagination?:boolean
}


export interface Category {
    id: string;
    name: string;
    slug: string;
  }