import { type QueryOptions, } from "@/types";

export interface AuthorQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}

export interface Author {
  [x: string]: any;
  id: string;
  name: string;
  slug: string;
}