

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface ImportQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Import {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }