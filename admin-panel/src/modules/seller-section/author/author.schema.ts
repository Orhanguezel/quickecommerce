"use client";
import { z } from "zod";
import multiLang from "@/components/molecules/multiLang.json";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const statusUpdateSchema = z.object({
    id: z.string(),
});

export type statusUpdateData = z.infer<typeof statusUpdateSchema> & {
    id: string;
    status: boolean | number | null | string;
};

const baseSchema = {
    name_df: z.string().min(2, "Author name must be at least 2 characters long"),
    bio_df: z.string().optional(),
    born_date: z.string().min(1, "Born date is required"),
    death_date: z
        .string()
        .optional()
        .refine((value) => {
            if (!value) return true; // Skip validation if not provided
            return new Date(value) <= new Date(); // Ensure it's not a future date
        }, {
            message: "Death date cannot be in the future",
        }),
    cover_image: z
        .instanceof(File)
        .refine((file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type), {
            message: "Only JPG, PNG, and GIF files are allowed",
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: "File size must be less than 5MB",
        })
        .optional(),
    profile_image: z
        .instanceof(File)
        .refine((file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type), {
            message: "Only JPG, PNG, and GIF files are allowed",
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: "File size must be less than 5MB",
        })
        .optional(),
};

// Adding dynamic multilingual fields
const dynamicFields = multiLang
    .filter((lang) => lang.id !== "df")
    .reduce((fields, lang) => {
        fields[`name_${lang.id}`] = z.string().optional();
        fields[`bio_${lang.id}`] = z.string().optional();
        return fields;
    }, {} as Record<string, z.ZodTypeAny>);

// Wrapping base schema in a refinement to validate death_date > born_date
export const authorSchema = z
    .object({
        ...baseSchema,
        ...dynamicFields,
    })
    .refine((data) => {
        if (!data.death_date) return true; // Allow if death_date is not provided
        return new Date(data.death_date) > new Date(data.born_date); // Ensure death_date > born_date
    }, {
        message: "Death date must be later than born date",
        path: ["death_date"], // Assign the error to the correct field
    });

export type AuthorFormData = z.infer<typeof authorSchema>;

