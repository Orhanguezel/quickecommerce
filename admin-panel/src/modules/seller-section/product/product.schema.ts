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
  name_df: z.string().min(2, "Brand name must be at least 2 characters long"),
  description_df: z.string().optional(),
  meta_keywords_df: z
    .array(z.string().nonempty("Each meta tag must not be empty"))
    .optional(),
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  store_id: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  unit_id: z.string().optional(),
  brand_id: z.string().optional(),
  type: z.string().optional(),
  discountType: z.string().optional(),
  discountPer: z.string().optional(),
  // warranty_text: z.string().optional(),
  // warranty_period: z.string().optional(),
  // available_time_starts: z.string().optional(),
  // available_time_ends: z.string().optional(),
  return_in_days: z.string().optional(),
  delivery_time_min: z.string().optional(),
  delivery_time_max: z.string().optional(),
  return_text_df: z.string().optional(),
  delivery_time_text_df: z.string().optional(),
  max_cart_qty: z.string().optional(),
  // manufacture_date: z.string().optional(),
  // expiry_date: z.string().optional(),
  // start_date: z.string().optional(),
  // start_time: z.string().optional(),
  // end_date: z.string().optional(),
  // end_time: z.string().optional(),
  video_url: z
    .union([
      z.literal(""),
      z.string().url("The video URL must be a valid URL."),
    ])
    .optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    fields[`meta_title_${lang.id}`] = z.string().optional();
    fields[`meta_description_${lang.id}`] = z.string().optional();
    fields[`meta_keywords_${lang.id}`] = z
      .array(z.string().nonempty("Each meta tag must not be empty"))
      .optional();
    fields[`return_text_${lang.id}`] = z.string().optional();
    fields[`delivery_time_text_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

const combinedSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export const productSchema = combinedSchema;
// .refine(
//   (data) => {
//     if (data.manufacture_date && data.expiry_date) {
//       return new Date(data.expiry_date) >= new Date(data.manufacture_date);
//     }
//     return true;
//   },
//   {
//     message: "Expire date must be later than or equal to manufacture date",
//     path: ["expiry_date"],
//   }
// )
// .refine(
//   (data) => {
//     if (data.available_time_starts && data.available_time_ends) {
//       return (
//         new Date(data.available_time_ends) >=
//         new Date(data.available_time_starts)
//       );
//     }
//     return true;
//   },
//   {
//     message:
//       "Available end time must be later than or equal to available start time",
//     path: ["available_time_ends"],
//   }
// );

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

export const productDeleteSchema = z.object({
  id: z.string(),
});
export type productDelete = z.infer<typeof productDeleteSchema> & {
  id: string;
};
