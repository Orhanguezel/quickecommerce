

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface BrandQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Brand {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }