

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface StoreQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  slug?: string;
  per_page?: any;
  status?: any;
  seller?: any;
  enabled?: boolean;
}


export interface Store {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }