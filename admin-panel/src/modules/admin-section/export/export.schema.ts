"use client";
import { z } from "zod";

const baseSchema = {
  type: z.string().optional(),
  format: z.string().optional(),
  min_id: z.string().optional(),
  max_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
};

export const exportSchema = z.object({
  ...baseSchema,
});

export type ExportFormData = z.infer<typeof exportSchema>;
