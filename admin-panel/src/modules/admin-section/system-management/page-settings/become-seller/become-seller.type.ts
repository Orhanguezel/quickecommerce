

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface BecomeSellerQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  start_date?: string;
  end_date?: string;
  store_id?: string;
  flash_sale_id?: string;
  status?: string;
}


export interface BecomeSeller {
  [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }