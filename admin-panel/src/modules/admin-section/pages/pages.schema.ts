"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const baseSchema = {
  // title_df: z.string(),
  title_df: z
    .string()
    .min(2, "Page name must be at least 2 characters long")
    .max(255, "The title field must not be greater than 255 characters."),
  content_df: z.string().optional(),
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  meta_keywords_df: z.array(z.string()).optional(),
  status: z.string().optional(),
  theme_name: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`content_${lang.id}`] = z.string().optional();
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    fields[`meta_keywords_${lang.id}`] = z
      .array(z.string().nonempty("Each meta keywords must not be empty"))
      .optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const pagesSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type PagesFormData = z.infer<typeof pagesSchema>;
