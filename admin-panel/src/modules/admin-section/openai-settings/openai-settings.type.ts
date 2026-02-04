

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface OpenAISettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface OpenAISettings {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }