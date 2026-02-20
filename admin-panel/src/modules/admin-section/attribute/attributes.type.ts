

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface AttributeQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface Attribute {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }

export interface AttributeTypeWiseQueryOptions {
  type?: string;
}