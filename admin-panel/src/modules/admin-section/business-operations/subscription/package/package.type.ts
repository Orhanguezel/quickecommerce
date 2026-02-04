

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface PackageQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Package {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }