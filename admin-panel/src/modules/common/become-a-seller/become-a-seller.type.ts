

import {
    type QueryOptions,
  } from "@/types";
  
  export interface BecomeASellerTypeQueryOptions extends QueryOptions {
    sort?: string;
    sortField?: string;
  }
  
  
  export interface BecomeASellerType {
      id: string;
      name: string;
      slug: string;
    }