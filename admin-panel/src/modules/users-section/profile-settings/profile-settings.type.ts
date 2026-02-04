

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface ProfileSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface ProfileSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }