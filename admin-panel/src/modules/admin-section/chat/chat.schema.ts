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
  com_pusher_app_id: z.string().optional(),
  com_pusher_app_key: z.string().optional(),
  com_pusher_app_cluster: z.string().optional(),
  com_pusher_app_secret: z.string().optional(),
};


export const ChatSettingsSchema = z.object({
  ...baseSchema,
});

export type ChatSettingsFormData = z.infer<typeof ChatSettingsSchema>;
