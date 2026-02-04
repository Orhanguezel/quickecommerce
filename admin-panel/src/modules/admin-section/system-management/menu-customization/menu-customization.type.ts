

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface MenuCustomizationQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  start_date?: string;
  end_date?: string;
  store_id?: string;
  flash_sale_id?: string;
  status?: string;
  pagination?:any
  per_page?:any
}


export interface MenuCustomization {
  [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }