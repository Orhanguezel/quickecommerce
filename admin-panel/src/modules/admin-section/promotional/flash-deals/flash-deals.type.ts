

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface FlashDealsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  start_date?: string;
  end_date?: string;
  store_id?: string;
  flash_sale_id?: string;
  status?: string;
  store_type?: string;
}


export interface FlashDeals {
  [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }