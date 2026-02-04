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
  name_df: z.string().min(2, "Shop name must be at least 2 characters long"),
  slug_df: z.string().optional(),
  address_df: z.string().optional(),
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  phone: z
    .string()
    .max(15, "Phone number may not be greater than 15 characters")
    .optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  vat_tax_number: z.string().optional(),
  opening_time: z
  .string()
  .optional()
  .refine((value) => !value || /^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:mm format",
  }),
closing_time: z
  .string()
  .optional()
  .refine((value) => !value || /^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:mm format",
  }),
  area_id: z.string().optional(),
  module: z.string().optional(),
  store_type: z.string().optional(),
  time_type: z.string().optional(),
  commission: z.string().optional(),
  amount: z.string().optional(),
  subscribe_amt: z.string().optional(),
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
    banner: z
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
    fields[`name_${lang.id}`] = z.string().optional();
    fields[`slug_${lang.id}`] = z.string().optional();
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const storeSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type StoreFormData = z.infer<typeof storeSchema>;
