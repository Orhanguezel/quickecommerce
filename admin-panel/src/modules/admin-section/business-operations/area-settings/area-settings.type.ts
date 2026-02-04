

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface AreaSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface AreaSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }