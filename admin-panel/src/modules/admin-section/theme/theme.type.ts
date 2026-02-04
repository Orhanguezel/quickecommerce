import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface TagQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?:boolean
}
export interface Theme {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }