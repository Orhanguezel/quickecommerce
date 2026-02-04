"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
  status?: string;
};

const baseSchema = {
  name_df: z
    .string()
    .min(2, "EmailTemplate name must be at least 2 characters long"),
  body_df: z.string().optional(),
  subject_df: z.string().optional(),
  type: z.string().optional(),
};
const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    fields[`body_${lang.id}`] = z.string().optional();
    fields[`subject_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);
export const emailTemplateSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;
