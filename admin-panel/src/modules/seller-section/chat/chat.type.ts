import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";


export interface ChatSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface ChatSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }
  
export interface LiveChatQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?: boolean;
  store_id?: any;
  status?: string;
  priority?: string;
  department_id?: string;
  ticket_id?: string;
  receiver_id?: any;
  receiver_type?: any;
  search?: any;
  type?: any;
}
export interface LiveChat {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}
