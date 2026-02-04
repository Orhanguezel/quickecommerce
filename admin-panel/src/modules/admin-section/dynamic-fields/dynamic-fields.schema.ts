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
    .min(2, "DynamicField name must be at least 2 characters long"),
  slug: z.string().optional(),
  store_type: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const dynamicFieldSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type DynamicFieldFormData = z.infer<typeof dynamicFieldSchema>;




const baseSchema2 = {
  value_df: z
    .string()
    .min(2, "DynamicField option value must be at least 2 characters long"),
};

const dynamicFieldOption = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`value_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const dynamicFieldOptionSchema = z.object({
  ...baseSchema2,
  ...dynamicFieldOption,
});

export type DynamicFieldOptionFormData = z.infer<typeof dynamicFieldOptionSchema>;