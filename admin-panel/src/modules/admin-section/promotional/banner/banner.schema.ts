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
  title_df: z
    .string()
    .min(2, "Banner name must be at least 2 characters long")
    .max(255, "The title field must not be greater than 255 characters."),
  title_color: z.string().optional(),
  sub_title_color: z.string().optional(),
  description_color: z.string().optional(),
  button_text_color: z.string().optional(),
  button_color: z.string().optional(),
  button_hover_color: z.string().optional(),
  background_color: z.string().optional(),
  sub_title_df: z
    .string()
    .max(255, "The sub title field must not be greater than 255 characters.")
    .optional(),
  description_df: z.string().optional(),
  button_text_df: z
    .string()
    .max(50, "The button text field must not be greater than 50 characters.")
    .optional(),
  redirect_url: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "The redirect URL must be a valid URL.",
    }),

  order: z.number().optional(),
  store_id: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
   theme_name: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`sub_title_${lang.id}`] = z.string().optional();
    fields[`button_text_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const bannerSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type BannerFormData = z.infer<typeof bannerSchema>;
