"use client";

import { z } from "zod";

export const statusUpdateSchema = z.object({
  id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
  id: string;
};

const  baseSchema = {
  // role_name: z.string().optional(),
  role_name: z
  .string()
  .min(2, { message: "Role name must be at least 2 characters long" })
  .max(255, { message: "Role name must be at most 255 characters long" }),

  available_for: z.string().optional(),
};


export const rolesSchema = z.object({
  ...baseSchema,
});


export type RoleFormData = z.infer<typeof rolesSchema>;












