import { type QueryOptions } from "@/types";

export interface NotificationsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  per_page?: any;
  status?: string;
}

export interface Notifications {
  id: string;
  name: string;
  slug: string;
}
