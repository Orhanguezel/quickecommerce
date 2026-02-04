"use client";
import { z } from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
  last_name: z.string().min(2, "Last name must be at least 2 characters long"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number can't exceed 15 digits")
    .regex(/^\d{10,15}$/, "Phone number must contain only digits"),
  email: z.string().email().optional(),
  password: z.string().optional(),
  permission: z.string().optional(),
  user_image: z
    .instanceof(File)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      {
        message: "Only JPG, PNG, and GIF files are allowed",
      }
    )
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "File size must be less than 5MB",
    })
    .optional(),
};
export const userSchema = z.object({
  ...baseSchema,
});
export type UserFormData = z.infer<typeof userSchema>;
