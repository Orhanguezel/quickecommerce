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
    .min(2, "Menu name must be at least 2 characters long")
    .max(255, "The title field must not be greater than 255 characters."),
  pages: z.string().optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const manuCustomizationSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type MenuCustomizationFormData = z.infer<typeof manuCustomizationSchema>;
