

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface SocialSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface SocialSettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }