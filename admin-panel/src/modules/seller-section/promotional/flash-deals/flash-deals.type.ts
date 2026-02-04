import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";

export interface FlashDealsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?: boolean;
  store_id?: string;
  status?: string;
  priority?: string;
  department_id?: string;
  per_page?: number;
}
export interface FlashDeals {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}
