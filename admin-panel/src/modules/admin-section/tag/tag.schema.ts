"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const baseSchema = {
  name_df: z
  .string()
  .min(2, "Tag name must be at least 2 characters long"),
  order: z.string().optional()
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const tagSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type TagFormData = z.infer<typeof tagSchema>;
