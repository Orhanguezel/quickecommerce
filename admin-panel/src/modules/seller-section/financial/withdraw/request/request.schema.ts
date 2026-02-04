"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
  status?: string;
};

const baseSchema = {
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => val.trim() !== "" && Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),

  withdraw_gateway_id: z
    .string()
    .refine((val) => val.trim() !== "", {
      message: "Payment method is required",
    }),

  details: z.string().optional(),
};

export const requestSchema = z.object({
  ...baseSchema,
gateways: z
  .record(
    z.string(),
    z.string().min(1, "Field is required")
  )
  .refine((obj) => Object.values(obj).every((val) => val.trim() !== ""), {
    message: "All gateway fields are required",
  }),
});

export type RequestFormData = z.infer<typeof requestSchema>;
