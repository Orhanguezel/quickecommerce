"use client";

import { z } from "zod";
import { getThemeLanguageData } from "@/components/blocks/admin-section/system-management/theme/utils/themeLanguage";

const baseSchema = {
  name_df: z
  .string()
  .min(2, "Theme name must be at least 2 characters long"),
  order: z.string().optional()
};

const dynamicFields = getThemeLanguageData()
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const tagSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type TagFormData = z.infer<typeof tagSchema>;

const baseSchemaRegister = {
  title_df: z.string().optional(),
  subtitle_df: z.string().optional(),
  description_df: z.string().optional(),
  terms_page_title_df: z.string().optional(),
  terms_page_url: z.string().optional(),
};

const dynamicFields2 = getThemeLanguageData()
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`subtitle_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    fields[`terms_page_title_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const pageSettingsSchemaRegister = z.object({
  ...baseSchemaRegister,
  ...dynamicFields2,
});

export type PageSettingsFormDataRegister = z.infer<typeof pageSettingsSchemaRegister>;
