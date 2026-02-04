"use client";
import { z } from "zod";

const baseSchema = {
  max_deposit_per_transaction: z.string().optional()
};
export const walletSettingsSchema = z.object({
  ...baseSchema,
});

export type WalletSettingsFormData = z.infer<typeof walletSettingsSchema>;
