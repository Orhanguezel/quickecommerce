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
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  canonical_url: z.string().optional(),
  og_title_df: z.string().optional(),
  og_description_df: z.string().optional(),
  meta_tag_df: z.array(z.string()).optional(),
  og_image: z
    .instanceof(File)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      {
        message: "Only JPG, PNG, and GIF files are allowed",
      }
    )
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "File size must be less than 5MB",
    })
    .optional(),
  date_field: z.date().nullable().optional(),
  date_time_field: z.date().nullable().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    fields[`og_title_${lang.id}`] = z.string().optional();
    fields[`og_description_${lang.id}`] = z.string().optional();
    fields[`meta_tag_${lang.id}`] = z
      .array(z.string().nonempty("Each meta tag must not be empty"))
      .optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const seoSettingsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type SEOSettingsFormData = z.infer<typeof seoSettingsSchema>;
