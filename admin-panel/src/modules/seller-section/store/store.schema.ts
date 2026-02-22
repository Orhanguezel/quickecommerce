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
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(255, { message: "First name must be at most 255 characters long" }),
  slug: z.string().optional(),
  address_df: z.string().optional(),
  meta_title_df: z
    .string()
    .max(255, { message: "Meta Title must be at most 255 characters long" })
    .optional(),
  meta_description_df: z
    .string()
    .max(1000, {
      message: "Meta description must be at most 1000 characters long",
    })
    .optional(),
  phone: z
    .string()
    .max(15, "Phone number may not be greater than 15 characters")
    .optional(),
  email: z
    .string()
    .min(2, { message: "Email must be at least 2 characters long" })
    .max(255, { message: "Email must be at most 255 characters long" })
    .email({ message: "Invalid email address" }),
  address: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  tax: z.number().optional(),
  tax_number: z
    .string()
    .max(255, { message: "Tax Number must be at most 255 characters long" })
    .optional(),
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
  store_types: z.array(z.string()).min(1, {
    message: "Store type is required",
  }),
  time_type: z.string().optional(),
  commission: z.string().optional(),
  amount: z.string().optional(),
  subscribe_amt: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    // fields[`address_${lang.id}`] = z.string().optional();
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const storeSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type StoreFormData = z.infer<typeof storeSchema>;
