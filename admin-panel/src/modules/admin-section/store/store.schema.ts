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

const allLangs = Array.isArray(multiLang)
  ? multiLang.filter((lang) => lang?.id)
  : [];
const defaultLangId = allLangs?.[0]?.id ?? "tr";

const baseSchema = {
  [`name_${defaultLangId}`]: z
    .string()
    .min(2, "Shop name must be at least 2 characters long"),
  [`meta_title_${defaultLangId}`]: z.string().optional(),
  [`meta_description_${defaultLangId}`]: z.string().optional(),
  slug: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  tax: z.number().optional(),
  tax_number: z.string().optional(),
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
  store_seller_id: z.string().optional(),
  store_types: z.array(z.string()).optional(),
  time_type: z.string().optional(),
  amount: z.string().optional(),
  phone: z.string().nonempty("Contact number is required"),
};

const dynamicFields = allLangs
  .filter((lang) => lang.id !== defaultLangId)
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const storeSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type StoreFormData = z.infer<typeof storeSchema>;


export const storeStatusSchema = z.object({
  id: z.string(),
});
export type storeStatus = z.infer<typeof storeStatusSchema> & {
  id: string;
};
