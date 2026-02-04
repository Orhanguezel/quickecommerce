

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface MaintenanceSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface MaintenanceSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }