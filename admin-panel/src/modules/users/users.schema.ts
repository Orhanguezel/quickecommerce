import { z } from "zod";
export const LoginSchema = z.object({
  email: z
    .string()
    .min(2, { message: "Email must be at least 2 characters long" })
    .max(255, { message: "Email must be at most 255 characters long" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  permissions: z.string().array().optional(),
  role: z.string().optional(),
  token: z.string().optional(),
});
export type Login = z.infer<typeof LoginSchema>;
export type LoginInput = Omit<
  z.infer<typeof LoginSchema>,
  "permissions" | "role" | "token"
>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["USER", "ADMIN"]),
  isTwoFactorEnabled: z.boolean(),
  isOAuth: z.boolean(),
});
export type User = z.infer<typeof UserSchema>;

const BaseRegisterObject = z.object({
  first_name: z
    .string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(255, { message: "First name must be at most 255 characters long" }),

  last_name: z
    .string()
    .max(255, { message: "Last name must be at most 255 characters long" })
    .optional(),

  phone: z.string().nonempty("Contact number is required").optional(),

  email: z
    .string()
    .min(2, { message: "Email must be at least 2 characters long" })
    .max(255, { message: "Email must be at most 255 characters long" })
    .email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),

  password_confirmation: z.string(),
});

export const RegisterSchema = BaseRegisterObject.refine(
  (data) => data.password === data.password_confirmation,
  { message: "Passwords do not match", path: ["password_confirmation"] }
);

export const SellerRegisterSchema = BaseRegisterObject.extend({
  // Şirket bilgileri
  company_name: z.string().min(1, { message: "Şirket adı zorunludur" }),
  sector: z.string().min(1, { message: "Sektör zorunludur" }),
  tax_number: z.string().min(1, { message: "Vergi numarası zorunludur" }),
  tax_office: z.string().optional(),
  brand_name: z.string().optional(),
  mersis_number: z.string().optional(),
  website_url: z.string().optional(),
  // Adres
  address_country: z.string().optional(),
  address_city: z.string().min(1, { message: "Şehir zorunludur" }),
  address_district: z.string().min(1, { message: "İlçe zorunludur" }),
  address_postal_code: z.string().optional(),
  address_line1: z.string().min(1, { message: "Adres satırı zorunludur" }),
  address_line2: z.string().optional(),
  // Banka
  bank_name: z.string().min(1, { message: "Banka adı zorunludur" }),
  bank_account_holder: z.string().min(1, { message: "Hesap sahibi zorunludur" }),
  bank_iban: z.string().min(10, { message: "IBAN zorunludur" }),
  bank_account_number: z.string().optional(),
  bank_branch_code: z.string().optional(),
  bank_swift_code: z.string().optional(),
}).refine(
  (data) => data.password === data.password_confirmation,
  { message: "Passwords do not match", path: ["password_confirmation"] }
);

export type SignUpInput = z.infer<typeof RegisterSchema>;
export type SellerSignUpInput = z.infer<typeof SellerRegisterSchema>;
export type SignUp = Omit<
  z.infer<typeof RegisterSchema>,
  "permissions" | "role" | "token"
>;
export const ForgetPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgetPasswordInput = z.infer<typeof ForgetPasswordSchema>;

export const TokenSchema = z.object({
  token: z
    .string()
    .refine((val) => typeof val === "string" && val.trim().length > 0, {
      message: "Token is required and must be a string",
    }),
});
export type TokenInput = z.infer<typeof TokenSchema> & { email: string };

export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/(?=.*[A-Z])(?=.*\d)(?=.{6}).*/, {
      message: "Password must contain at least one uppercase",
    }),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema> & {
  email: string;
  token: string;
};

export const ChangePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/(?=.*[A-Z])(?=.*\d)(?=.{6}).*/, {
        message: "Password must contain at least one uppercase",
      }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/(?=.*[A-Z])(?=.*\d)(?=.{6}).*/, {
        message: "Password must contain at least one uppercase",
      }),
    passwordConfirmation: z.string(),
  })
  .superRefine(({ passwordConfirmation, newPassword }, ctx) => {
    if (passwordConfirmation !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["passwordConfirmation"], // path of error
      });
    }
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
