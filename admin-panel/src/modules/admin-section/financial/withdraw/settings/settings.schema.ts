"use client";
import { z } from "zod";

const baseSchema = {
  maximum_withdrawal_limit: z.string().optional(),
  minimum_withdrawal_limit: z.string().optional()
};
export const withdrawSettingsSchema = z.object({
  ...baseSchema,
});

export type WithdrawSettingsFormData = z.infer<typeof withdrawSettingsSchema>;
