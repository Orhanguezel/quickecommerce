"use client";

import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const statusUpdateSchema = z.object({
  ticket_id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  ticket_id: string;
  priority?: string;
};

const baseSchema = {
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
  email: z
    .string()
    .min(2, { message: "Email must be at least 2 characters long" })
    .max(255, { message: "Email must be at most 255 characters long" })
    .email({ message: "Invalid email address" }),
  phone: z.string().nonempty("Contact number is required"),
  message: z
    .string()
    .max(1000, { message: "Message must be at most 1000 characters long" })
    .optional(),
};

export const contactUsSchema = z.object({
  ...baseSchema,
});

export type ContactUsFormData = z.infer<typeof contactUsSchema>;
