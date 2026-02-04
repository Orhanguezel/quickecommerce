

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface CurrencyQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Currency {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }