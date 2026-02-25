"use client";

import { z } from "zod";

const baseSchema = {
  default_order_commission_rate: z
    .number()
    .min(0, "Commission rate must be at least 0"),
  default_delivery_commission_charge: z
    .number()
    .min(0, "Delivery commission rate must be at least 0")
    .max(100, "Delivery commission rate cannot exceed 100"),
  order_shipping_charge: z
    .number()
    .min(0, "Minimum shipping charge must be at least 0"),
  free_shipping_min_order_value: z
    .number()
    .min(0, "Free shipping threshold must be at least 0"),
  order_additional_charge_name: z.string().optional(),
  order_additional_charge_amount: z.number().optional(),
  commission_amount: z.number().optional(),
  order_additional_charge_commission: z.number().optional(),
};

export const commissionSettingsSchema = z.object({
  ...baseSchema,
});

export type CommissionSettingsFormData = z.infer<
  typeof commissionSettingsSchema
>;
