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
  com_openai_api_key: z.string().optional(),
  com_openai_model: z.string().optional(),
  com_openai_timeout: z.string().optional(),
  com_openai_enable_disable: z.string().optional(),
  com_claude_api_key: z.string().optional(),
  com_claude_model: z.string().optional(),
  com_claude_timeout: z.string().optional(),
  com_claude_enable_disable: z.string().optional(),
};

export const openAISettingsSchema = z.object({
  ...baseSchema,
});

export type OpenAISettingsFormData = z.infer<typeof openAISettingsSchema>;
