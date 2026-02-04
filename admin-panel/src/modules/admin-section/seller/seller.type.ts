

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface SellerQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  per_page?: any;
  status?: any;
}


export interface Seller {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }