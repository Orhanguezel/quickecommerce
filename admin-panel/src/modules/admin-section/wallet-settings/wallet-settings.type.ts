import { type QueryOptions } from "@/types";
import { ToastContent } from "react-toastify";

export interface WalletSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}

export interface WalletSettings {
  [x: string]: ToastContent<unknown>;
  id: string;
  name: string;
  slug: string;
}
