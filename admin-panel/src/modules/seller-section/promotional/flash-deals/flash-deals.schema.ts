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
  title: z.string().min(2, "Title must be at least 2 characters long"),
  subject: z.string().min(2, "Subject must be at least 2 characters long"),
  // priority: z.string().optional(),
  priority: z
    .string()
    .refine(
      (value) =>
        value !== "none" &&
        value !== "undefined" &&
        value !== "null" &&
        value !== "",
      {
        message: "Priority is required",
      }
    ),
  department_id: z
    .string()
    .refine(
      (value) =>
        value !== "none" &&
        value !== "undefined" &&
        value !== "null" &&
        value !== "",
      {
        message: "Department is required",
      }
    ),
  // department_id: z.string().optional(),
};

export const supportTicketSchema = z.object({
  ...baseSchema,
});

export type FlashDealsFormData = z.infer<typeof supportTicketSchema>;





const baseSchema2 = {
  message: z.string().min(2, "Subject must be at least 2 characters long"),
};

// Adding file validation
const fileSchema = z
  .instanceof(File)
  .refine((file) => ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/zip", "application/pdf"].includes(file.type), {
    message: "Invalid file type! Only jpg, png, jpeg, webp, zip, and pdf are allowed.",
  })
  .refine((file) => file.size <= 10 * 1024 * 1024, {
    message: "File size must be less than 10MB",
  });

// Include file in schema
export const supportTicketSchema2 = z.object({
  ...baseSchema2,
  file: fileSchema.optional(),
});

export type FlashDealsFormData2 = z.infer<typeof supportTicketSchema2>;