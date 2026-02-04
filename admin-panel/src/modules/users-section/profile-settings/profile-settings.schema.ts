"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const statusUpdateSchema = z.object({
  old_password: z.string(),
  new_password: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  old_password: string;
  new_password: string;
};

const baseSchema = {
  first_name: z
    .string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(255, { message: "First name must be at most 255 characters long" }),
    last_name: z
    .string()
    .max(255, { message: "Last name must be at most 255 characters long" }).optional(),
  phone: z.string().optional(),
  email: z
      .string()
      .min(2, { message: "Email must be at least 2 characters long" })
      .max(255, { message: "Email must be at most 255 characters long" })
      .email({ message: "Invalid email address" }),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`first_name_${lang.id}`] = z.string().optional();
    fields[`last_name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const profileSettingsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;
