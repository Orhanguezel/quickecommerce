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
  com_quick_access: z
  .array(
    z.object({
      title: z.string().min(1, { message: "Title is required" }),
      url: z
        .string()
        
    })
  )
  .optional(),
  com_our_info: z
  .array(
    z.object({
      title: z.string().min(1, { message: "Title is required" }),
      url: z
        .string()
        
    })
  )
  .optional(),
  title_df: z.string().optional(),
  sub_title_df: z.string().optional(),
  contact_number_df: z.string().optional(),
  street_address_df: z.string().optional(),
  footer_copyright_df: z.string().optional(),
  website_url: z.string().optional(),
  email: z.string().optional(),
  com_site_time_zone: z.string().optional(),
  com_site_logo: z
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
  com_site_favicon: z
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
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`sub_title_${lang.id}`] = z.string().optional();
    fields[`contact_number_${lang.id}`] = z.string().optional();
    fields[`street_address_${lang.id}`] = z.string().optional();
    fields[`footer_copyright_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const generalSettingsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
