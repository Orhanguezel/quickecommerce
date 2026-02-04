

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface FirebaseSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  offset?:any
}
export interface FirebaseSettingsControls {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }