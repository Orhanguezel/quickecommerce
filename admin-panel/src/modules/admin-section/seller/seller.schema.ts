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
    last_name: z.string().max(255).optional(),
    phone: z.string().optional(),
    email: z
      .string()
      .min(2, { message: "Email must be at least 2 characters long" })
      .max(255, { message: "Email must be at most 255 characters long" })
      .email({ message: "Invalid email address" }),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    // KYC fields
    business_type:       z.enum(["individual", "company"]).optional(),
    company_name:        z.string().max(255).optional(),
    brand_name:          z.string().max(255).optional(),
    sector:              z.string().max(255).optional(),
    tax_office:          z.string().max(255).optional(),
    tax_number:          z.string().max(100).optional(),
    mersis_number:       z.string().max(100).optional(),
    website_url:         z.string().max(255).optional(),
    address_country:     z.string().max(100).optional(),
    address_city:        z.string().max(100).optional(),
    address_district:    z.string().max(100).optional(),
    address_postal_code: z.string().max(20).optional(),
    address_line1:       z.string().max(500).optional(),
    address_line2:       z.string().max(500).optional(),
    bank_name:           z.string().max(255).optional(),
    bank_account_holder: z.string().max(255).optional(),
    bank_iban:           z.string().max(50).optional(),
    bank_account_number: z.string().max(50).optional(),
    bank_branch_code:    z.string().max(50).optional(),
    bank_swift_code:     z.string().max(20).optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type SellerFormData = z.infer<typeof sellerSchema>;
