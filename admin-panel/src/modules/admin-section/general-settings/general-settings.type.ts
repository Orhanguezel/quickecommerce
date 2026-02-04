

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface GeneralSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface GeneralSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }