

import {
  type QueryOptions,
} from "@/types";

export interface StockReportQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  stock_type?:string
}


export interface StockReport {
    id: string;
    name: string;
    slug: string;
  }