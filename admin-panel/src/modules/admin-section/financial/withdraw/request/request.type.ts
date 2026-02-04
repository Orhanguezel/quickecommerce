

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface RequestQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  from_date?: string;
  to_date?: string;
  per_page?: any;
  store_id?: string;
  flash_sale_id?: string;
  status?: string;
  order_id?: string;
  payment_status?: string;
  search?: string;
  amount?: string;
}


export interface Request {
  [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }