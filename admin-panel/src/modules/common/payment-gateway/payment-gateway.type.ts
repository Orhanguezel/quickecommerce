

import {
  type QueryOptions,
} from "@/types";

export interface PaymentGatewayQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}


export interface PaymentGateway {
    id: string;
    name: string;
    slug: string;
  }