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
  name_df: z
    .string()
    .min(2, "Name must be at least 2 characters long"),
  description_df: z.string().optional(),
  status: z.string().optional(),
  capacity: z.string().optional(),
  speed_range: z.string().optional(),
  fuel_type: z.string().optional(),
  max_distance: z.string().optional(),
  extra_charge: z.string().optional(),
  average_fuel_cost: z.string().optional()
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`name_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const vehicleTypeSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type VehicleTypeFormData = z.infer<typeof vehicleTypeSchema>;
