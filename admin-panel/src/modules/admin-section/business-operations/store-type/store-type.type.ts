

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface StoreTypeQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  per_page?: any;
}


export interface StoreType {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }