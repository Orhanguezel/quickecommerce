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
  subtitle_df: z.string().optional(),
  page_title_df: z.string().optional(),
  meta_title_df: z.string().optional(),
  meta_description_df: z.string().optional(),
  meta_keywords_df: z.array(z.string()).optional(),
  status: z.string().optional(),
  state_df: z.string().optional(),
  theme_name: z.string().optional(),

  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
};

const dynamicFields = multiLang.reduce((fields, lang) => {
  fields[`page_title_${lang.id}`] = z.string().optional();
  fields[`meta_title_${lang.id}`] = z.string().optional();
  fields[`meta_description_${lang.id}`] = z.string().optional();
  fields[`meta_keywords_${lang.id}`] = z
    .array(z.string().nonempty("Each meta keywords must not be empty"))
    .optional();
  fields[`state_${lang.id}`] = z.string().optional();
  fields[`title_${lang.id}`] = z.string().optional();
  fields[`subtitle_${lang.id}`] = z.string().optional();
  return fields;
}, {} as Record<string, z.ZodTypeAny>);

export const contactSettingsSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type ContactSettingsFormData = z.infer<typeof contactSettingsSchema>;
