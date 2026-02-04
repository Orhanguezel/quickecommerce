

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface CouponQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Coupon {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }