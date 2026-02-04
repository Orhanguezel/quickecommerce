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
    .min(2, "Blog Category name must be at least 2 character long"),
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  status: z.string().optional(), 
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    fields[`status_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const blogCategorySchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type BlogCategoryFormData = z.infer<typeof blogCategorySchema>;
