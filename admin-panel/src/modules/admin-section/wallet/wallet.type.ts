"use client";

import { z } from "zod";

import {
  type QueryOptions,
} from "@/types";

export interface WalletQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  type?: string;
  store_id?: string;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
  owner_type?: any;
  status?: any;
  per_page?: any;
}


export interface Wallet {
    id: string;
    name: string;
    slug: string;
  }
  export const walletStatusSchema = z.object({
    id: z.string(),
  });
  export type walletStatus = z.infer<typeof walletStatusSchema> & {
    id: string;
  };