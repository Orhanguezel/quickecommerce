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
  com_google_app_id: z.string().optional(),
  com_google_client_secret: z.string().optional(),
  com_google_client_callback_url: z.string().optional(),
  com_facebook_app_id: z.string().optional(),
  com_facebook_client_secret: z.string().optional(),
  com_facebook_client_callback_url: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`sub_title_${lang.id}`] = z.string().optional();
    fields[`contact_number_${lang.id}`] = z.string().optional();
    fields[`street_address_${lang.id}`] = z.string().optional();
    fields[`footer_copyright_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const socialSettingsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type SocialLoginSettingsFormData = z.infer<typeof socialSettingsSchema>;
