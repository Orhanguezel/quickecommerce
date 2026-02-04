import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface BlogCategoryQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?:boolean
  status?:any
}
export interface BlogCategory {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }