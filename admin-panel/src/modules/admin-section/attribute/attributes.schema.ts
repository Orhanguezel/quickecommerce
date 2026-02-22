"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const baseSchema = {
  attribute_name_df: z
    .string()
    .min(2, "Attribute name must be at least 2 characters long"),
    attribute_values: z
    .array(z.string())
    .optional(),
    product_type: z.string().optional(),
    category_id: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`attribute_name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const attributeSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type AttributeFormData = z.infer<typeof attributeSchema>;


export const attributeStatusSchema = z.object({
  id: z.string(),
  status: z.number(),
});
export type attributeStatusChange = z.infer<typeof attributeStatusSchema> & {
  id: string;
  status: number;
};
export const attributeDeleteSchema = z.object({
  id: z.string(),
});
export type attributeDelete = z.infer<typeof attributeDeleteSchema> & {
  id: string;
};
