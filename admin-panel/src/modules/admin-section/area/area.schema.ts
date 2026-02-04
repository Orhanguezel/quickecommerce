"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const baseSchema = {
  area_name_df: z
    .string()
    .min(2, "Area name must be at least 2 characters long"),
  display_code_df: z
    .string()
    .optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`area_name_${lang.id}`] = z.string().optional();
    fields[`display_code_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const areaSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type AreaFormData = z.infer<typeof areaSchema>;


export const areaStatusSchema = z.object({
  id: z.string(),
});
export type areaStatusChange = z.infer<typeof areaStatusSchema> & {
  id: string;
};
export const areaDeleteSchema = z.object({
  id: z.string(),
});
export type areaDelete = z.infer<typeof areaDeleteSchema> & {
  id: string;
};
