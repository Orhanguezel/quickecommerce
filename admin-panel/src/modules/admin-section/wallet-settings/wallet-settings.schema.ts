"use client";
import { z } from "zod";

const baseSchema = {
  max_deposit_per_transaction:  z.string().optional(),
  bank_transfer_bank_name:      z.string().optional(),
  bank_transfer_account_holder: z.string().optional(),
  bank_transfer_iban:           z.string().optional(),
  bank_transfer_description:    z.string().optional(),
};
export const walletSettingsSchema = z.object({
  ...baseSchema,
});

export type WalletSettingsFormData = z.infer<typeof walletSettingsSchema>;
