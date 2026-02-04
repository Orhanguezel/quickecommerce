import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface PagesQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?:boolean
}
export interface Pages {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }