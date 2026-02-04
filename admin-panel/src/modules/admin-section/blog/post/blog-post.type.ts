import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface BlogPostQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?:boolean
}
export interface BlogPost {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }