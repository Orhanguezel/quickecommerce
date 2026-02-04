

import {
  type QueryOptions,
} from "@/types";
import { SetStateAction } from "react";
import { ToastContent } from "react-toastify";

export interface StoreQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  slug?: string;
  enabled?: boolean;
  store_id?: any;
}


export interface Store {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }