import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";

export interface WithdrawSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}

export interface WithdrawSettings {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}
