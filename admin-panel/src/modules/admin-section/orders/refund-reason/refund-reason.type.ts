

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface RefundReasonQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  start_date?: string;
  end_date?: string;
  per_page?: any;
  store_id?: string;
  flash_sale_id?: string;
  status?: string;
  order_id?: string;
  payment_status?: string;
  search?: string;
}


export interface RefundReason {
  [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }