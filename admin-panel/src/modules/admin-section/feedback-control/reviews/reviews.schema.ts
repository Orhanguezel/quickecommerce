"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};

const baseSchema = {
  title_df: z
    .string()
    .min(2, "Reviews name must be at least 2 characters long"),
  description_df: z.string().optional(),
  discount_type: z.string().optional(),
  store_type: z.string().optional(),
  store_id: z.string().optional(),
  product_ids: z
  .array(z.number())
  .min(1, "You must select at least one store")
  .optional(),
  discount_amount: z.number().optional(),
  special_price: z.number().optional(),
  purchase_limit: z.number().optional(),
  start_date: z.string().optional(),
  start_time: z.string().optional(),
  end_date: z.string().optional(),
  end_time: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const flashDealsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type ReviewsFormData = z.infer<typeof flashDealsSchema>;
