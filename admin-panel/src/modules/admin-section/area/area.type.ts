

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface AreaQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Area {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }