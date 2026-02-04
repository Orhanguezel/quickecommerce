"use client";

import { z } from "zod";

export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};

const baseSchema = {
  com_google_recaptcha_v3_site_key: z.string().optional(),
  com_google_recaptcha_v3_secret_key: z.string().optional(),
};


export const recaptchaSettingsSchema = z.object({
  ...baseSchema,
});

export type RecaptchaSettingsFormData = z.infer<typeof recaptchaSettingsSchema>;
