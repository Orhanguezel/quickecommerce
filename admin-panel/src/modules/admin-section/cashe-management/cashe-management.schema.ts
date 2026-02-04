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
  cache_clear_type: z.string().optional(),
};

export const casheManagementSchema = z.object({
  ...baseSchema,
});

export type CasheManagementFormData = z.infer<typeof casheManagementSchema>;
