"use client";
import { z } from "zod";

const baseSchema = {
    email: z.string().email("Invalid email address"),
};

export const subscribeSchema = z.object({
    ...baseSchema,
});


export type SubscribeFormData = z.infer<typeof subscribeSchema>;