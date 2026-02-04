import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";

export interface ReportAnalyticsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  search?: any;
  start_date?: string;
  end_date?: string;
  store_id?: string;
  type?: string;
  flash_sale_id?: string;
  status?: string;
  per_page?: any;
  order_status?: any;
  payment_status?: any;
  area_id?: any;
  customer_id?: any;
  payment_gateway?: any;
}

export interface ReportAnalytics {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}
