"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";
export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};

const baseSchema = {
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters long"),
  last_name: z.string().optional(),
  phone: z
    .string()
    .max(15, "Phone number may not be greater than 15 characters")
    .optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  status: z.string().optional(),
  vehicle_type_id: z.string().optional(),
  area_id: z.string().optional(),
  identification_type: z.string().optional(),
  identification_number: z.string().optional(),
  address: z.string().optional(),
};

const dynamicFields = multiLang
  .filter((lang) => lang.id !== "df")
  .reduce((fields, lang) => {
    fields[`title_${lang.id}`] = z.string().optional();
    fields[`description_${lang.id}`] = z.string().optional();
    return fields;
  }, {} as Record<string, z.ZodTypeAny>);

export const deliverymanSchema = z.object({
  ...baseSchema,
  ...dynamicFields,
});

export type DeliverymanFormData = z.infer<typeof deliverymanSchema>;
