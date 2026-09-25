"use client";

import { z } from "zod";

const baseSchema = {
  com_loyalty_enabled: z.string().optional(),
  com_loyalty_redeem_enabled: z.string().optional(),
  com_loyalty_earn_per_currency: z.string().optional(),
  com_loyalty_redeem_points_per_unit: z.string().optional(),
  com_loyalty_redeem_value: z.string().optional(),
  com_loyalty_min_redeem_points: z.string().optional(),
  com_loyalty_voucher_min_order: z.string().optional(),
  com_loyalty_voucher_valid_days: z.string().optional(),
  com_loyalty_review_bonus_with_image: z.string().optional(),
  com_loyalty_review_bonus_no_image: z.string().optional(),
  com_loyalty_review_max_per_order: z.string().optional(),
  com_loyalty_points_expire_days: z.string().optional(),
  com_review_invite_window_days: z.string().optional(),
};

export const loyaltySettingsSchema = z.object({ ...baseSchema });

export type LoyaltySettingsFormData = z.infer<typeof loyaltySettingsSchema>;
