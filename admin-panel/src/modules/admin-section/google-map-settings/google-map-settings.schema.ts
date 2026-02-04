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
  com_google_map_api_key: z.string().optional(),
};


export const googleMapSettingsSchema = z.object({
  ...baseSchema,
});

export type GoogleMapSettingsFormData = z.infer<typeof googleMapSettingsSchema>;
