

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface SMTPSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface SMTPSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }