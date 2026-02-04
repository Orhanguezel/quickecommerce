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
  com_site_global_email: z.string().email("Invalid email address").optional(),
  com_site_smtp_mail_mailer: z.string().optional(),
  com_site_smtp_mail_host: z.string().optional(),
  com_site_smtp_mail_post: z.string().optional(),
  com_site_smtp_mail_username: z.string().optional(),
  com_site_smtp_mail_password: z.string().optional(),
  com_site_smtp_mail_encryption: z.string().optional(),
};

export const smtpSettingsSchema = z.object({
  ...baseSchema,
});

export type SMTPSettingsFormData = z.infer<typeof smtpSettingsSchema>;


const testSMTPSchema = {
  test_email: z.string().email("Invalid email address").optional(),
};

export const testSmtpSettingsSchema = z.object({
  ...testSMTPSchema,
});

export type TestSMTPSettingsFormData = z.infer<typeof testSmtpSettingsSchema>;
