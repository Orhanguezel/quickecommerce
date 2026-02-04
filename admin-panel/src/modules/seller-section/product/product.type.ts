

"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const mediaDeleteSchema = z.object({
  image_id: z.string(),
});

export type mediaDeleteData = z.infer<typeof mediaDeleteSchema> & {
  image_id: string;
};
export const altChangeSchema = z.object({
  image_id: z.string(),
  alt: z.string(),
});

export type altChangeData = z.infer<typeof altChangeSchema> & {
  image_id: string;
  alt: string;
};





import {
  type QueryOptions,
} from "@/types";
import { ToastContent } from "react-toastify";

export interface ProductQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  offset?:any
  store_id?:any
  status?:any
  per_page?:any
}


export interface Product {
    [x: string]: ToastContent<unknown>;
    id: string;
    name: string;
    slug: string;
    stores:[]
  }

  export interface Media {
    [x: string]: ToastContent<unknown>;
    file: string;
  }

  