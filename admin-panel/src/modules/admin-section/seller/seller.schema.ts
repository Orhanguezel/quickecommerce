"use client";

import { z } from "zod";
export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};

export const sellerSchema = z
  .object({
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
    password_confirmation: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type SellerFormData = z.infer<typeof sellerSchema>;
