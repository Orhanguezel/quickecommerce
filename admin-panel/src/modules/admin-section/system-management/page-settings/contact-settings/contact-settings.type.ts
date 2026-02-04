

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface ContactSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  start_date?: string;
  end_date?: string;
  store_id?: string;
  flash_sale_id?: string;
  status?: string;
}


export interface ContactSettings {
  [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }