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
  title_df: z.string().optional(),
  description_df: z.string().optional(),
  com_maintenance_mode: z.string().optional(),
  start_date: z.date().nullable().optional(),
  end_date: z.date().nullable().optional(),
  date_time_field: z.date().nullable().optional(),
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
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const maintenanceSettingsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type MaintenanceSettingsFormData = z.infer<
  typeof maintenanceSettingsSchema
>;
