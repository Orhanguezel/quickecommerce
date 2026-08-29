import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";

export interface LoyaltySettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}

export interface LoyaltySettings {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}
