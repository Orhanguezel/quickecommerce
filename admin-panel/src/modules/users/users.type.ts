

import {
  type QueryOptions,
} from "@/types";

export interface UsersQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  slug?: string;
  store_slug?: string;
  storedSlug?: string;
}


export interface Users {
    id: string;
    name: string;
    slug: string;
    store_slug: string;
    storedSlug: string;
  }

  export interface Email {
    email: string;
}
export interface Token {
    token: string;
}