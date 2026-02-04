

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface SMSProviderSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}
export interface SMSProviderSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }