

import {
  type QueryOptions,
} from "@/types";

export interface BusinessPlanQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  store_id?: string;
  per_page?: any;
}


export interface BusinessPlan {
  id: string;
  name: string;
  slug: string;
}


export interface GenerateBusinessPlanHMACQueryOptions extends QueryOptions {
  store_id: any
}