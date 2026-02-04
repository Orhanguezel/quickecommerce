import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";

export interface TransactionReportQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  search?: any;
  start_date?: any;
  end_date?: any;
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
  transaction_type?: any;
}

export interface TransactionReport {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}
