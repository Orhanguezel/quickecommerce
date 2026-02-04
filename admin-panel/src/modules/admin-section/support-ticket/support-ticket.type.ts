import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";

export interface SupportTicketQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?: boolean;
  store_id?: string;
  status?: string;
  priority?: string;
  department_id?: string;
  ticket_id?: string;
}
export interface SupportTicket {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}
