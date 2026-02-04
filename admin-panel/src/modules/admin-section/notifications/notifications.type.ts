

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface NotificationsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  per_page?: any;
  status?: any;
  notifiable_type?: any;
}


export interface Notifications {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }