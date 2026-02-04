"use client";

import { z } from "zod";

const baseSchema = {
  delivery_charge_method: z.string().optional(),
  per_km_charge_amount: z.string().optional(),
  fixed_charge_amount: z.string().optional(),
  out_of_area_delivery_charge: z.string().optional(),
  min_order_delivery_fee: z.string().optional(),
  delivery_time_per_km: z
      .string()
      .min(1, "Amount must be greater than 0"),
};

export const areaSettingsSchema = z.object({
  ...baseSchema,
});

export type AreaSettingsFormData = z.infer<typeof areaSettingsSchema>;

export const areaSettingsStatusSchema = z.object({
  id: z.string(),
});
export type areaSettingsStatusChange = z.infer<
  typeof areaSettingsStatusSchema
> & {
  id: string;
};
export const areaSettingsDeleteSchema = z.object({
  id: z.string(),
});
export type areaSettingsDelete = z.infer<typeof areaSettingsDeleteSchema> & {
  id: string;
};
