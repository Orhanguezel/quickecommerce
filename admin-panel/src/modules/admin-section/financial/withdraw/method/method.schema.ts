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
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(255, "The title field must not be greater than 255 characters."),
};

export const methodSchema = z.object({
  ...baseSchema
});

export type MethodFormData = z.infer<typeof methodSchema>;
