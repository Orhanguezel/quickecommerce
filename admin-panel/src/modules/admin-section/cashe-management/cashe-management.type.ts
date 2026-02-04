

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface CasheManagementQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface CasheManagement {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }