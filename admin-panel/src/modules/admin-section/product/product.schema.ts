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
  product_name_df: z
    .string()
    .min(2, "Brand name must be at least 2 characters long"),
  store: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  unit: z.string().optional(),
  brand: z.string().optional(),
  type: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  weight: z.string().optional(),
  price: z.string().optional(),
  stock_quantity: z.string().optional(),
  discountType: z.string().optional(),
  discountPer: z.string().optional(),
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
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`product_name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const productSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type ProductFormData = z.infer<typeof productSchema>;

export const mediaSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      {
        message: "Only JPG, PNG, and GIF files are allowed",
      }
    ),
});

export type ProductMediaData = z.infer<typeof mediaSchema>;
