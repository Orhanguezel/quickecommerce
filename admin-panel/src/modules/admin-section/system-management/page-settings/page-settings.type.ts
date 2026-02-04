

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface PageSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface PageSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }