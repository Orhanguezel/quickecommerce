"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
  status: boolean | number | null | string;
};

const baseSchema = {
  name_df: z.string().min(2, "Author name must be at least 2 characters long"),

  // legacy/global - backward compatible (root bio payload can still exist)
  bio: z.string().optional(),

  // global fields
  born_date: z.string().optional(),
  death_date: z.string().optional(),
};

const dynamicFields = (Array.isArray(multiLang) ? multiLang : [])
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();

    // ✅ bio is i18n too
    fields[`bio_${lang.id}`] = z.string().optional();

    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

const combinedSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export const authorSchema = combinedSchema.refine(
  (data) => {
    if (data.born_date && data.death_date) {
      return new Date(data.death_date) >= new Date(data.born_date);
    }
    return true;
  },
  {
    message: "Death date must be later than or equal to born date",
    path: ["death_date"],
  }
);

export type AuthorFormData = z.infer<typeof authorSchema>;
