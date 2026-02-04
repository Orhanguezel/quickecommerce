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
    withdraw_gateway_id:z.string().optional(),
    amount:z.string().optional(),
    details:z.string().optional(),
};

export const requestSchema = z.object({
  ...baseSchema
});

export type RequestFormData = z.infer<typeof requestSchema>;
