

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface DynamicFieldQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  dynamic_field_id?: string;
}


export interface DynamicField {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }