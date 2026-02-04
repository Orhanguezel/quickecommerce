"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const baseSchema = {
  name_df: z
    .string()
    .min(2, "StoreType name must be at least 2 characters long"),
  description_df: z.string().optional(),
  additional_charge_name_df: z.string().optional(),
  additional_charge_amount: z.string().optional(),
  additional_charge_type: z.string().optional(),
  additional_charge_commission: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    fields[`additional_charge_name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const storeTypeSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type StoreTypeFormData = z.infer<typeof storeTypeSchema>;

export const storeTypeStatusSchema = z.object({
  id: z.string(),
});
export type storeTypeStatusChange = z.infer<typeof storeTypeStatusSchema> & {
  id: string;
};
export const storeTypeDeleteSchema = z.object({
  id: z.string(),
});
export type storeTypeDelete = z.infer<typeof storeTypeDeleteSchema> & {
  id: string;
};
