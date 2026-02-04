

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface RecaptchaSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface RecaptchaSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }