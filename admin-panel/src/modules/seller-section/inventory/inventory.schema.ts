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
  title_df: z
    .string()
    .min(2, "coupon title must be at least 2 characters long"),
  description_df: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const couponSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type CouponFormData = z.infer<typeof couponSchema>;

export const couponStatusSchema = z.object({
  id: z.string(),
});

export type couponStatusChange = z.infer<typeof couponStatusSchema> & {
  id: string;
};
export const couponDeleteSchema = z.object({
  id: z.string(),
});
export type couponDelete = z.infer<typeof couponDeleteSchema> & {
  id: string;
};