

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface ExportQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Export {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }