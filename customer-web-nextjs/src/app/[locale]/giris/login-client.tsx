"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { useLoginMutation } from "@/modules/auth/auth.service";
import { loginSchema, type LoginFormValues } from "@/modules/auth/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import Image from "next/image";

interface Props {
  translations: {
    login_title: string;
    email: string;
    password: string;
    forgot_password: string;
    dont_have_account: string;
    register: string;
    login: string;
    remember_me: string;
    login_error: string;
    loading: string;
    or: string;
    google: string;
    facebook: string;
    social_error: string;
  };
}

export function LoginClient({ translations: t }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const { loginConfig } = useThemeConfig();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const rememberMe = watch("remember_me");

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className={`mx-auto ${loginConfig.imageUrl ? "max-w-6xl" : "max-w-md"}`}>
        <div className={`grid gap-8 ${loginConfig.imageUrl ? "md:grid-cols-2" : "grid-cols-1"} items-center`}>
          {/* Left - Theme Image (optional) */}
          {loginConfig.imageUrl && (
            <div className="relative hidden h-[600px] overflow-hidden rounded-lg md:block">
              <Image
                src={loginConfig.imageUrl}
                alt={loginConfig.title || t.login_title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          )}

          {/* Right - Login Form */}
          <div className={`${loginConfig.imageUrl ? "" : "w-full"}`}>
            <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <LogIn className="mx-auto mb-3 h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold">{loginConfig.title || t.login_title}</h1>
            {loginConfig.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">
                {loginConfig.subtitle}
              </p>
            )}
          </div>

          {loginMutation.isError && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {(loginMutation.error as any)?.response?.data?.message ||
                t.login_error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.password}</Label>
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-primary hover:underline"
                >
                  {t.forgot_password}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember_me"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue("remember_me", checked === true)
                }
              />
              <Label htmlFor="remember_me" className="text-sm font-normal">
                {t.remember_me}
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t.loading : t.login}
            </Button>
          </form>

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

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.dont_have_account}{" "}
            <Link
              href={ROUTES.REGISTER}
              className="font-medium text-primary hover:underline"
            >
              {t.register}
            </Link>
          </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
