

import {
  type QueryOptions,
} from "@/types";

export interface WalletQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  store_id?: any;
  start_date?: string;
  end_date?: string;
}


export interface Wallet {
  id: string;
  name: string;
  slug: string;
}


export interface GenerateWalletHMACQueryOptions extends QueryOptions {
  wallet_history_id: any
}