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
  order_id: z.string().optional(),
  deliveryman_id: z.string().optional(),
  reference: z.string().optional(),
  activity_value: z.string().optional(),
};

export const cashCollectSchema = z.object({
  ...baseSchema,
});

export type CashCollectFormData = z.infer<typeof cashCollectSchema>;
