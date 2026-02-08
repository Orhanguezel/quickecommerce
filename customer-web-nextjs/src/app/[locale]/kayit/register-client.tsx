"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { useRegisterMutation } from "@/modules/auth/auth.service";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/modules/auth/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import Image from "next/image";

interface Props {
  translations: {
    register_title: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
    already_have_account: string;
    login: string;
    register: string;
    register_error: string;
    loading: string;
    or: string;
    google: string;
    facebook: string;
    social_error: string;
  };
}

export function RegisterClient({ translations: t }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegisterMutation();
  const { registerConfig } = useThemeConfig();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className={`mx-auto ${registerConfig.imageUrl ? "max-w-6xl" : "max-w-md"}`}>
        <div className={`grid gap-8 ${registerConfig.imageUrl ? "md:grid-cols-2" : "grid-cols-1"} items-center`}>
          {/* Left - Theme Image (optional) */}
          {registerConfig.imageUrl && (
            <div className="relative hidden h-[700px] overflow-hidden rounded-lg md:block">
              <Image
                src={registerConfig.imageUrl}
                alt={registerConfig.title || t.register_title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          )}

          {/* Right - Register Form */}
          <div className={`${registerConfig.imageUrl ? "" : "w-full"}`}>
            <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <UserPlus className="mx-auto mb-3 h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold">{registerConfig.title || t.register_title}</h1>
            {(registerConfig.subtitle || registerConfig.description) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {registerConfig.subtitle}
              </p>
            )}
          </div>

          {registerMutation.isError && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {(registerMutation.error as any)?.response?.data?.message ||
                t.register_error}
            </div>
          )}

          {registerConfig.isSocialLoginEnabled && (
            <Suspense>
              <SocialLoginButtons
                translations={{
                  or: t.or,
                  google: t.google,
                  facebook: t.facebook,
                  social_error: t.social_error,
                }}
              />
            </Suspense>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t.or}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t.first_name}</Label>
                <Input
                  id="first_name"
                  autoComplete="given-name"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">{t.last_name}</Label>
                <Input
                  id="last_name"
                  autoComplete="family-name"
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="05XX XXX XX XX"
                autoComplete="tel"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                {t.confirm_password}
              </Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password_confirmation")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? t.loading : t.register}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.already_have_account}{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-primary hover:underline"
            >
              {t.login}
            </Link>
          </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
