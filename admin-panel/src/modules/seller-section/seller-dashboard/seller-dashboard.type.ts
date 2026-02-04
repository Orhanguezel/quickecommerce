import { type QueryOptions } from "@/types";

export interface SellerDashboardQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?: boolean;
  store_id?: string;
  status?: string;
  priority?: string;
  department_id?: string;
  per_page?: number;
  slug?: string;
  start_date?: any;
  end_date?: any;
  time_period?: any;
}
export interface SellerDashboard {
  id: string;
  name: string;
  slug: string;
}
