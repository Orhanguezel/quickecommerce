

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface ApprovalQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  brand_id?: string;
  category_id?: string;
  stock_status?: string;
  store_id?: string;
  per_page?: any;
  type?: string;
  status?: any;
}


export interface Approval {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }