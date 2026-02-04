"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};

const baseSchema = {
  title_df: z
    .string()
    .min(2, "Notice name must be at least 2 characters long")
    .max(255, "The title field must not be greater than 255 characters."),
    message_df: z.string().optional(),
    type: z.string().optional(),
    priority: z.string().optional(),
    active_date: z.string().optional(),
    expire_date: z.string().optional(),
    store_id: z.string().optional(),
    seller_id: z.string().optional(),
};


const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`message_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

const combinedSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export const noticeSchema = combinedSchema

  .refine(
    (data) => {
      if (data.active_date && data.expire_date) {
        return (
          new Date(data.expire_date) >=
          new Date(data.active_date)
        );
      }
      return true; // Skip validation if either field is missing
    },
    {
      message:
        "Expire date time must be later than or equal to active date",
      path: ["expire_date"], // Attach the error to the available_time_ends field
    }
  );



export type NoticeFormData = z.infer<typeof noticeSchema>;
