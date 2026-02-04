

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface GoogleMapSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  offset?:any
}
export interface GoogleMapSettingsControls {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }