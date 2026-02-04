

import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface PaymentSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  currency_settings: string;

}

export interface PaymentSettings {
    id: string;
    name: string;
    slug: string;
  }
export interface GetwayModel {
    [x: string]: ToastContent<unknown>;
    gateways: any;
  }