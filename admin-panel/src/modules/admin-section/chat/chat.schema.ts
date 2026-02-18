"use client";

import { z } from "zod";

export const ChatSettingsSchema = z.object({
  com_pusher_app_id: z.string().optional(),
  com_pusher_app_key: z.string().optional(),
  com_pusher_app_secret: z.string().optional(),
  com_pusher_app_cluster: z.string().optional(),
});

export type ChatSettingsFormData = z.infer<typeof ChatSettingsSchema>;

export const AiChatSettingsSchema = z.object({
  com_ai_chat_enabled: z.string().optional(),
  com_ai_chat_active_provider: z
    .enum(["groq", "openai", "anthropic", "gemini"])
    .optional(),
  com_ai_chat_api_key: z.string().optional(),
  com_ai_chat_model: z.string().optional(),
  com_ai_chat_max_tokens: z.coerce.number().min(100).max(4096).optional(),
  com_ai_chat_temperature: z.coerce.number().min(0).max(2).optional(),
  com_ai_chat_system_prompt: z.string().optional(),
  com_ai_chat_guest_enabled: z.string().optional(),
});

export type AiChatSettingsFormData = z.infer<typeof AiChatSettingsSchema>;

export const AiChatKnowledgeSchema = z.object({
  id: z.number().optional(),
  category: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  sort_order: z.coerce.number().min(0).optional(),
  is_active: z.boolean().optional(),
  question_en: z.string().optional(),
  answer_en: z.string().optional(),
});

export type AiChatKnowledgeFormData = z.infer<typeof AiChatKnowledgeSchema>;
