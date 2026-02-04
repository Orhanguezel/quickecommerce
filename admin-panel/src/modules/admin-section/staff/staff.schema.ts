"use client";
import { z } from "zod";
export const statusUpdateSchema = z.object({
  id: z.string(),
});
export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};
const baseSchema = {
  first_name: z
    .string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(255, { message: "First name must be at most 255 characters long" }),
  last_name: z
    .string()
    .max(255, { message: "Last name must be at most 255 characters long" })
    .optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .min(2, { message: "Email must be at least 2 characters long" })
    .max(255, { message: "Email must be at most 255 characters long" })
    .email({ message: "Invalid email address" }),
  password: z.string().optional(),
  permission: z.string().optional(),
};

export const staffSchema = z.object({
  ...baseSchema,
});
export type StaffFormData = z.infer<typeof staffSchema>;
