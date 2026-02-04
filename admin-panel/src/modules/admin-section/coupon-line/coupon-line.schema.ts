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
  customer_id: z.union([z.number(), z.null()]).optional(), 
  discount_type: z.string().min(1, "Discount type is required"),
  discount: z.number().min(1, "Required"),
  min_order_value: z.number().optional(),
  max_discount: z.number().optional(),
  usage_limit: z.number().optional(),
  // usage_count: z.number().optional(),
  start_date: z
        .string()
        .min(1, "Start date is required"),
    end_date: z
        .string()
        .min(1, "End date is required"),
};

export const couponLineSchema = z.object({
  ...baseSchema,
});

export type CouponLineFormData = z.infer<typeof couponLineSchema>;

export const couponLineStatusSchema = z.object({
  id: z.string(),
});

export type couponLineStatusChange = z.infer<typeof couponLineStatusSchema> & {
  id: string;
};
export const couponLineDeleteSchema = z.object({
  id: z.string(),
});
export type couponLineDelete = z.infer<typeof couponLineDeleteSchema> & {
  id: string;
};
