

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface FooterCustomizationQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface FooterCustomization {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
  }