

import {
  type QueryOptions,
} from "@/types";

export interface DepartmentQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Department {
    id: string;
    name: string;
    slug: string;
  }