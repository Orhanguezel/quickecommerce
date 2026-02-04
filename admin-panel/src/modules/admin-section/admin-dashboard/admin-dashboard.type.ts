import { type QueryOptions } from "@/types";

export interface AdminDashboardQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?: boolean;
  store_id?: string;
  status?: string;
  priority?: string;
  department_id?: string;
  per_page?: number;
  start_date?: any;
  end_date?: any;
  time_period?: any;
  store_type?: any;
}
export interface AdminDashboard {
  id: string;
  name: string;
  slug: string;
}
