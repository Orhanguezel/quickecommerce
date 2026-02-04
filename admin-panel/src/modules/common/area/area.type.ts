

import {
  type QueryOptions,
} from "@/types";

export interface AreaDropdownQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface AreaDropdown {
    id: string;
    name: string;
    slug: string;
  }