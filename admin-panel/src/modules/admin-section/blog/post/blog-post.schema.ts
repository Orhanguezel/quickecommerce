"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};

const baseSchema = {
  tag_name: z.array(z.string()).optional(),
  meta_keywords_df: z.array(z.string()).optional(),
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  title_df: z.string().min(2, "Title must be at least 2 characters long"),
  description_df: z
    .string()
    .min(2, "Description must be at least 2 characters long"),
  author: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  visibility: z.string().optional(),
  start_date: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    fields[`meta_keywords_${lang.id}`] = z
      .array(z.string().nonempty("Each meta keywords must not be empty"))
      .optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const blogPostSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
