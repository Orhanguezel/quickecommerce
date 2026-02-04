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

export const importSchema = z.object({
  ...baseSchema,
});

export type ImportFormData = z.infer<typeof importSchema>;
