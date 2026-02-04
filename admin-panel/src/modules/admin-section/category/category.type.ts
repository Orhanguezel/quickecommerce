

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface CategoryQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  pagination?:boolean
  per_page?:any
  list?:boolean
}


export interface Category {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }