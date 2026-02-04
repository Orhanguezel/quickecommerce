

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface StaffQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  per_page?: any;
}


export interface Staff {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }