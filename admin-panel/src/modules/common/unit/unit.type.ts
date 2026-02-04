

import {
  type QueryOptions,
} from "@/types";

export interface UnitQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Unit {
    id: string;
    name: string;
    slug: string;
  }