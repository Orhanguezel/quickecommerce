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
  com_quick_access: z
  .array(
    z.object({
      com_quick_access_title: z.string().min(1, { message: "Title is required" }),
      com_quick_access_url: z
        .string()
        
    })
  )
  .optional(),
  com_our_info: z
  .array(
    z.object({
      title: z.string().min(1, { message: "Title is required" }),
      url: z
        .string()
        
    })
  )
  .optional(),
  com_help_center: z
  .array(
    z.object({
      title: z.string().min(1, { message: "Title is required" }),
      url: z
        .string()
        
    })
  )
  .optional(),
  com_social_links_facebook_url: z.string().optional(),
  com_social_links_twitter_url: z.string().optional(),
  com_social_links_instagram_url: z.string().optional(),
  com_social_links_linkedin_url: z.string().optional(),
  com_download_app_link_one: z.string().optional(),
  com_download_app_link_two: z.string().optional(),
 
 
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

export const footerCustomizationSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type FooterCustomizationFormData = z.infer<typeof footerCustomizationSchema>;
