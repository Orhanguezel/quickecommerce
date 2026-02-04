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
  name_df: z
    .string()
    .min(2, "Name must be at least 2 characters long"),
  description_df: z.string().optional(),
  type: z.string().min(2, "Type must be at least 2 characters long"),
  validity: z.string().min(1, "Validity must be at least 1 characters long"),
  price: z.string().optional(),
  order_limit: z.string().optional(),
  product_limit: z.string().optional(),
  product_featured_limit: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const packageSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type PackageFormData = z.infer<typeof packageSchema>;

export const packageStatusSchema = z.object({
  id: z.string(),
});

export type packageStatusChange = z.infer<typeof packageStatusSchema> & {
  id: string;
  status?:any
};
export const packageDeleteSchema = z.object({
  id: z.string(),
  status: z.string(),
});
export type packageDelete = z.infer<typeof packageDeleteSchema> & {
  id: string;
};