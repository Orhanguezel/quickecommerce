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
  brand_name_df: z
    .string()
    .min(2, "Brand name must be at least 2 characters long"),
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  display_order: z.string().optional(),
  logo: z
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
  brand_logo: z
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
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`brand_name_${lang.id}`] = z.string().optional();
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const brandSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type BrandFormData = z.infer<typeof brandSchema>;
