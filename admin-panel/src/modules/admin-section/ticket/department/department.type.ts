import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface DepartmentQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?:boolean
  per_page?:any
}
export interface Department {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }