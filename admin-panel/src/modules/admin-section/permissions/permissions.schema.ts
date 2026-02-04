"use client";

import { z } from "zod";

export const permissionsUpdateSchema = z.object({
  id: z.string(),
});

export type permissionsForStoreOwner = z.infer<typeof permissionsUpdateSchema> & {
  id: string;
};



