"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const firstLang = multiLang[0]; // "tr"

const baseSchema = {
  [`category_name_${firstLang.id}`]: z.string().min(2, "Category name must be at least 2 characters"),
  status: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== firstLang.id)
  .reduce((fields, lang) => {
    fields[`category_name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const categorySchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const categoryStatusSchema = z.object({
  id: z.string(),
  status: z.number(),
});
export type categoryStatusChange = z.infer<typeof categoryStatusSchema> & {
  id: string;
  status: number;
};
