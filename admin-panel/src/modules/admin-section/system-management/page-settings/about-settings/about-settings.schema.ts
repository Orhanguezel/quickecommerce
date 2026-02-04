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
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  meta_keywords_df: z.array(z.string()).optional(),
  status: z.string().optional(),
  theme_name: z.string().optional(),

  about_title_df: z.string().optional(),
  about_subtitle_df: z.string().optional(),
  about_description_df: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(1000, "Description cannot exceed 1000 characters"),

  story_title_df: z.string().optional(),
  story_subtitle_df: z.string().optional(),

  mission_title_df: z.string().optional(),
  mission_subtitle_df: z.string().optional(),

  testimonial_title_df: z.string().optional(),
  testimonial_subtitle_df: z.string().optional(),
};

const dynamicFields = multiLang.reduce((fields, lang) => {
  fields[`title_${lang.id}`] = z.string().optional();
  fields[`meta_title_${lang.id}`] = z.string().optional();
  fields[`meta_description_${lang.id}`] = z.string().optional();
  fields[`meta_keywords_${lang.id}`] = z
    .array(z.string().nonempty("Each meta keywords must not be empty"))
    .optional();
  // Translation fields for login_register_section
  fields[`about_title_${lang.id}`] = z.string().optional();
  fields[`about_subtitle_${lang.id}`] = z.string().optional();
  fields[`about_description_${lang.id}`] = z.string().optional();

  // Translation fields for on_board_section
  fields[`story_title_${lang.id}`] = z.string().optional();
  fields[`story_subtitle_${lang.id}`] = z.string().optional();

  // Translation fields for video_section
  fields[`mission_title_${lang.id}`] = z.string().optional();
  fields[`mission_subtitle_${lang.id}`] = z.string().optional();

  // Translation fields for join_benefits_section
  fields[`testimonial_title_${lang.id}`] = z.string().optional();
  fields[`testimonial_subtitle_${lang.id}`] = z.string().optional();

  return fields;
}, {} as Record<string, z.ZodTypeAny>);

export const aboutSettingsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type AboutSettingsFormData = z.infer<typeof aboutSettingsSchema>;
