"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import {
  useLoginMutation,
  useGuestCheckoutMutation,
  useGuestCheckoutSendCodeMutation,
} from "@/modules/auth/auth.service";
import {
  useOtpLoginResendMutation,
  useOtpLoginSendMutation,
  useOtpLoginVerifyMutation,
} from "@/modules/auth/auth.service";
import { loginSchema, type LoginFormValues } from "@/modules/auth/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Eye, EyeOff, Mail, Lock, ChevronRight } from "lucide-react";
import { useThemeConfig } from "@/modules/theme/use-theme-config";
import Image from "next/image";
import { useSiteInfoQuery } from "@/modules/site/site.action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  translations: {
    home: string;
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
    login_with_otp: string;
    otp_title: string;
    otp_subtitle: string;
    otp_code: string;
    send_otp: string;
    resend_otp: string;
    verify_otp: string;
    otp_error: string;
    otp_sent: string;
  };
}

export function LoginClient({ translations: t }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const loginMutation = useLoginMutation();
  const guestMutation = useGuestCheckoutMutation();
  const guestCodeMutation = useGuestCheckoutSendCodeMutation();
  const [showGuest, setShowGuest] = useState(false);
  // Misafir akisi iki adim: "form" (ad/e-posta/telefon) -> "code" (6 haneli kod).
  const [guestStep, setGuestStep] = useState<"form" | "code">("form");
  const [guest, setGuest] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [guestCode, setGuestCode] = useState("");
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState<string | null>(null);
  const [guestCooldown, setGuestCooldown] = useState(0);

  useEffect(() => {
    if (guestCooldown <= 0) return;
    const id = setTimeout(() => setGuestCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [guestCooldown]);

  const guestApiError = (err: unknown, fallback = "Bir hata oluştu, lütfen tekrar deneyin.") => {
    const res = (err as { response?: { data?: { code?: string; message?: string; retry_after?: number | null } } })
      ?.response?.data;
    if (res?.code === "email_registered") {
      return "Bu e-posta veya telefon kayıtlı. Lütfen giriş yapın.";
    }
    return res?.message || fallback;
  };

  const submitGuestCheckout = (code?: string) => {
    guestMutation.mutate(
      { ...guest, code },
      {
        onError: (err: unknown) => setGuestError(guestApiError(err)),
      }
    );
  };

  // 1. adim: bilgileri dogrula ve e-postaya kod gonder.
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError(null);
    setGuestInfo(null);

    if (!guest.first_name.trim() || !guest.email.trim() || !guest.phone.trim()) {
      setGuestError("Ad, e-posta ve telefon zorunludur.");
      return;
    }
    // Sunucu libphonenumber ile dogruluyor; burada sadece hizli on kontrol.
    if (guest.phone.replace(/\D/g, "").length < 10) {
      setGuestError("Geçerli bir telefon numarası giriniz (ör. 0555 123 45 67).");
      return;
    }

    guestCodeMutation.mutate(
      { email: guest.email, first_name: guest.first_name, phone: guest.phone },
      {
        onSuccess: (data) => {
          // Sunucuda dogrulama kapaliysa kod adimini atla.
          if (data?.verification_required === false) {
            submitGuestCheckout();
            return;
          }
          setGuestStep("code");
          setGuestInfo(`Doğrulama kodu ${guest.email} adresine gönderildi.`);
          setGuestCooldown(data?.retry_after ?? 60);
        },
        onError: (err: unknown) => {
          const res = (err as { response?: { data?: { code?: string; retry_after?: number | null } } })
            ?.response?.data;
          // Kod zaten gonderilmis (60 sn kilidi) -> kod adimina gec.
          if (res?.code === "cooldown" && res.retry_after) {
            setGuestStep("code");
            setGuestInfo(`Doğrulama kodu ${guest.email} adresine gönderildi.`);
            setGuestCooldown(res.retry_after);
            return;
          }
          setGuestError(guestApiError(err));
        },
      }
    );
  };

  // 2. adim: kodu dogrula ve misafir oturumunu ac.
  const handleGuestCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError(null);

    const trimmed = guestCode.trim();
    if (trimmed.length !== 6) {
      setGuestError("Lütfen e-postanıza gelen 6 haneli kodu girin.");
      return;
    }

    submitGuestCheckout(trimmed);
  };

  const handleGuestResend = () => {
    setGuestError(null);
    guestCodeMutation.mutate(
      { email: guest.email, first_name: guest.first_name, phone: guest.phone },
      {
        onSuccess: (data) => {
          setGuestInfo(`Doğrulama kodu ${guest.email} adresine tekrar gönderildi.`);
          setGuestCooldown(data?.retry_after ?? 60);
        },
        onError: (err: unknown) => {
          const res = (err as { response?: { data?: { retry_after?: number | null } } })?.response?.data;
          if (res?.retry_after) setGuestCooldown(res.retry_after);
          setGuestError(guestApiError(err));
        },
      }
    );
  };
  const otpSendMutation = useOtpLoginSendMutation();
  const otpResendMutation = useOtpLoginResendMutation();
  const otpVerifyMutation = useOtpLoginVerifyMutation();
  const { loginConfig } = useThemeConfig();
  const { siteInfo } = useSiteInfoQuery();
  const isOtpEnabled =
    siteInfo?.com_user_login_otp === "on" ||
    siteInfo?.otp_login_enabled_disable === "on";
  const showGoogle = siteInfo?.com_google_login_enabled === "on";
  const showFacebook = siteInfo?.com_facebook_login_enabled === "on";
  const showSocialButtons = showGoogle || showFacebook;

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

  const openOtpDialog = () => {
    const candidateEmail = watch("email") || "";
    setOtpEmail(candidateEmail);
    setOtpCode("");
    setOtpSent(false);
    setOtpOpen(true);
  };

  const sendOtp = () => {
    if (!otpEmail.trim()) return;
    otpSendMutation.mutate(
      { email: otpEmail.trim() },
      {
        onSuccess: () => {
          setOtpSent(true);
        },
      }
    );
  };

  const resendOtp = () => {
    if (!otpEmail.trim()) return;
    otpResendMutation.mutate({ email: otpEmail.trim() });
  };

  const verifyOtp = () => {
    if (!otpEmail.trim() || !otpCode.trim()) return;
    otpVerifyMutation.mutate(
      { email: otpEmail.trim(), otp: otpCode.trim() },
      {
        onSuccess: () => {
          setOtpOpen(false);
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-10">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary">{loginConfig.title || t.login_title}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_560px]">
        {/* Side image — desktop only */}
        <div className="hidden md:flex items-start justify-center pt-8">
          {loginConfig.imageUrl && (
            <div className="overflow-hidden rounded-xl border max-w-[380px] sticky top-24">
              <Image
                src={loginConfig.imageUrl}
                alt={loginConfig.title || t.login_title}
                width={380}
                height={320}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <div className="rounded-lg border bg-card p-7 shadow-sm">
            <h1 className="mb-7 text-center text-[44px] font-semibold leading-none tracking-tight text-foreground md:text-[46px]">
              {loginConfig.title || t.login_title}
            </h1>
            {loginConfig.subtitle && (
              <p className="-mt-4 mb-5 text-center text-sm text-muted-foreground">
                {loginConfig.subtitle}
              </p>
            )}
            {/* Mobile image — inside card */}
            {loginConfig.imageUrl && (
              <div className="mb-5 overflow-hidden rounded-md border md:hidden">
                <Image
                  src={loginConfig.imageUrl}
                  alt={loginConfig.title || t.login_title}
                  width={520}
                  height={180}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}

            {loginMutation.isError && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {t.login_error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.email}
                  autoComplete="email"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
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
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pl-10"
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

            {isOtpEnabled && (
              <>
                <div className="my-3 text-center text-muted-foreground">{t.or}</div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={openOtpDialog}
                >
                  {t.login_with_otp}
                </Button>
              </>
            )}

            {/* Misafir (guest) checkout — üyeliksiz sipariş */}
            <div className="mt-4">
              {!showGuest ? (
                <>
                  <div className="my-3 text-center text-sm text-muted-foreground">{t.or}</div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowGuest(true)}
                  >
                    Üye olmadan devam et
                  </Button>
                </>
              ) : guestStep === "form" ? (
                <form onSubmit={handleGuestSubmit} className="space-y-3 rounded-lg border p-4">
                  <p className="text-sm font-medium">Misafir olarak devam et</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Ad *"
                      value={guest.first_name}
                      onChange={(e) => setGuest({ ...guest, first_name: e.target.value })}
                      autoComplete="given-name"
                    />
                    <Input
                      placeholder="Soyad"
                      value={guest.last_name}
                      onChange={(e) => setGuest({ ...guest, last_name: e.target.value })}
                      autoComplete="family-name"
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="E-posta *"
                    value={guest.email}
                    onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                    autoComplete="email"
                  />
                  <Input
                    type="tel"
                    placeholder="Telefon *"
                    value={guest.phone}
                    onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                    autoComplete="tel"
                  />
                  {guestError && (
                    <p className="text-sm text-destructive">{guestError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={guestCodeMutation.isPending || guestMutation.isPending}
                  >
                    {guestCodeMutation.isPending || guestMutation.isPending
                      ? "Gönderiliyor…"
                      : "Devam et"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Siparişinizi üyelik olmadan tamamlayabilirsiniz. E-posta adresinize
                    tek kullanımlık bir doğrulama kodu göndereceğiz; sipariş durumu ve
                    fatura bilgileri de bu adrese iletilir.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleGuestCodeSubmit} className="space-y-3 rounded-lg border p-4">
                  <p className="text-sm font-medium">E-posta doğrulama</p>
                  {guestInfo && !guestError && (
                    <p className="text-sm text-green-700 dark:text-green-400">{guestInfo}</p>
                  )}
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-xl tracking-[0.4em]"
                    value={guestCode}
                    onChange={(e) => setGuestCode(e.target.value.replace(/\D/g, ""))}
                  />
                  {guestError && (
                    <p className="text-sm text-destructive">{guestError}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={guestMutation.isPending}>
                    {guestMutation.isPending ? "Devam ediliyor…" : "Doğrula ve devam et"}
                  </Button>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setGuestStep("form");
                        setGuestError(null);
                        setGuestInfo(null);
                      }}
                    >
                      Bilgileri düzenle
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={guestCooldown > 0 || guestCodeMutation.isPending}
                      onClick={handleGuestResend}
                    >
                      {guestCooldown > 0
                        ? `Tekrar gönder (${guestCooldown})`
                        : "Kodu tekrar gönder"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kod gelmediyse spam/gereksiz klasörünü kontrol edin.
                  </p>
                </form>
              )}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t.dont_have_account}{" "}
              <Link
                href={ROUTES.REGISTER}
                className="font-medium text-primary hover:underline"
              >
                {t.register}
              </Link>
            </p>

            {showSocialButtons && (
              <Suspense>
                <SocialLoginButtons
                  translations={{
                    or: t.or,
                    google: t.google,
                    facebook: t.facebook,
                    social_error: t.social_error,
                  }}
                  showGoogle={showGoogle}
                  showFacebook={showFacebook}
                  googleClientId={siteInfo?.com_google_app_id}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.otp_title}</DialogTitle>
            <DialogDescription>{t.otp_subtitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="otp_email">{t.email}</Label>
              <Input
                id="otp_email"
                type="email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                placeholder={t.email}
              />
            </div>

            {otpSent && (
              <div className="space-y-1.5">
                <Label htmlFor="otp_code">{t.otp_code}</Label>
                <Input
                  id="otp_code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder={t.otp_code}
                />
              </div>
            )}

            {(otpSendMutation.isError ||
              otpResendMutation.isError ||
              otpVerifyMutation.isError) && (
              <p className="text-sm text-destructive">{t.otp_error}</p>
            )}

            {!otpSent ? (
              <Button
                type="button"
                className="w-full"
                onClick={sendOtp}
                disabled={otpSendMutation.isPending || !otpEmail.trim()}
              >
                {otpSendMutation.isPending ? t.loading : t.send_otp}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={verifyOtp}
                  disabled={otpVerifyMutation.isPending || !otpCode.trim()}
                >
                  {otpVerifyMutation.isPending ? t.loading : t.verify_otp}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={resendOtp}
                  disabled={otpResendMutation.isPending}
                >
                  {otpResendMutation.isPending ? t.loading : t.resend_otp}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {t.otp_sent}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
