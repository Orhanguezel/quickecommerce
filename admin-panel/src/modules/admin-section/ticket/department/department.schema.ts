"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const baseSchema = {
  name_df: z
  .string()
  .min(2, "Department name must be at least 2 characters long"),
  status: z.string().optional()
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const departmentSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
