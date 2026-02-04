"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
  status?:string
};

const baseSchema = {
  reason_df: z
    .string()
    .min(2, "coupon title must be at least 2 characters long"),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`reason_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const refundReasonSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type RefundRequestFormData = z.infer<typeof refundReasonSchema>;
