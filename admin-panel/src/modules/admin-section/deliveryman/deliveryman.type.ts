

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface DeliverymanQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  search?: any;
  start_date?: string;
  end_date?: string;
  vehicle_type_id?: any;
  type?: string;
  flash_sale_id?: string;
  status?: string;
  per_page?: any;
  order_status?: any;
  identification_type?: any;
  area_id?: any;
  customer_id?: any;
  payment_gateway?: any;
}


export interface Deliveryman {
  [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }