import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};

const baseSchema = {
  title_df: z.string().optional(),
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  meta_keywords_df: z.array(z.string()).optional(),
  status: z.string().optional(),
  theme_name: z.string().optional(),

  register_title_df: z.string().optional(),
  register_subtitle_df: z.string().optional(),
  login_title_df: z.string().optional(),
  login_subtitle_df: z.string().optional(),
  onboard_title_df: z.string().optional(),
  onboard_subtitle_df: z.string().optional(),
  agree_button_title_df: z.string().optional(),

  section_title_df: z.string().optional(),
  section_subtitle_df: z.string().optional(),
  video_url: z.string().optional(),

  join_benefits_title_df: z.string().optional(),
  join_benefits_subtitle_df: z.string().optional(),

  faq_title_df: z.string().optional(),
  faq_subtitle_df: z.string().optional(),

  contact_title_df: z.string().optional(),
  contact_subtitle_df: z.string().optional(),
  contact_agree_button_title_df: z.string().optional(),
};

const dynamicFields = multiLang.reduce((fields, lang) => {
  fields[`title_${lang.id}`] = z.string().optional();
  fields[`meta_title_${lang.id}`] = z.string().optional();
  fields[`meta_description_${lang.id}`] = z.string().optional();
  fields[`meta_keywords_${lang.id}`] = z
    .array(z.string().nonempty("Each meta keywords must not be empty"))
    .optional();

  fields[`register_title_${lang.id}`] = z.string().optional();
  fields[`register_subtitle_${lang.id}`] = z.string().optional();
  fields[`login_title_${lang.id}`] = z.string().optional();
  fields[`login_subtitle_${lang.id}`] = z.string().optional();
  fields[`agree_button_title_${lang.id}`] = z.string().optional();

  fields[`onboard_title_${lang.id}`] = z.string().optional();
  fields[`onboard_subtitle_${lang.id}`] = z.string().optional();

  fields[`section_title_${lang.id}`] = z.string().optional();
  fields[`section_subtitle_${lang.id}`] = z.string().optional();

  fields[`join_benefits_title_${lang.id}`] = z.string().optional();
  fields[`join_benefits_subtitle_${lang.id}`] = z.string().optional();

  fields[`faq_title_${lang.id}`] = z.string().optional();
  fields[`faq_subtitle_${lang.id}`] = z.string().optional();

  fields[`contact_title_${lang.id}`] = z.string().optional();
  fields[`contact_subtitle_${lang.id}`] = z.string().optional();
  fields[`contact_agree_button_title_${lang.id}`] = z.string().optional();

  return fields;
}, {} as Record<string, z.ZodTypeAny>);

export const becomeSellerSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type BecomeSellerFormData = z.infer<typeof becomeSellerSchema>;
