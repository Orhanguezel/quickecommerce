

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface CouponLineQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface CouponLine {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }