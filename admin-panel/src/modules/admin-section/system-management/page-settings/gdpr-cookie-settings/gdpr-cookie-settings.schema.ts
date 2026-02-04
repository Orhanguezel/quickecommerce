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
  com_gdpr_title_df: z.string().optional(),
  com_gdpr_message_df: z.string().optional(),
  com_gdpr_more_info_label_df: z.string().optional(),
  com_gdpr_more_info_link: z.string().optional(),
  com_gdpr_accept_label_df: z.string().optional(),
  com_gdpr_decline_label_df: z.string().optional(),
  com_gdpr_manage_label_df: z.string().optional(),
  com_gdpr_manage_title_df: z.string().optional(),
  section_title_df: z.string().optional(),
  section_details_df: z.string().optional(),
  com_gdpr_expire_date: z.string().optional(),
  com_gdpr_show_delay: z.string().optional(),
};

const dynamicFields = multiLang.reduce((fields, lang) => {
  // Translation fields for login_register_section
  fields[`com_gdpr_title_${lang.id}`] = z.string().optional();
  fields[`com_gdpr_message_${lang.id}`] = z.string().optional();
  fields[`com_gdpr_more_info_label_${lang.id}`] = z.string().optional();
  fields[`com_gdpr_accept_label_${lang.id}`] = z.string().optional();
  fields[`com_gdpr_decline_label_${lang.id}`] = z.string().optional();
  fields[`com_gdpr_manage_label_${lang.id}`] = z.string().optional();
  fields[`com_gdpr_manage_title_${lang.id}`] = z.string().optional();
  fields[`section_title_${lang.id}`] = z.string().optional();
  fields[`section_details_${lang.id}`] = z.string().optional();


  return fields;
}, {} as Record<string, z.ZodTypeAny>);

export const GDPRCookieSettingsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type GDPRCookieSettingsFormData = z.infer<typeof GDPRCookieSettingsSchema>;