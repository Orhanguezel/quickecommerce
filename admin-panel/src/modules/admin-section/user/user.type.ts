

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface UserQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface User {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }