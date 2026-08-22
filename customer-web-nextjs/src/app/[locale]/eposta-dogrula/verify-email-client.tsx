"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MailCheck, ShieldCheck } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSendVerificationCodeMutation,
  useVerifyEmailMutation,
} from "@/modules/auth/auth.service";
import { useAuthStore } from "@/stores/auth-store";

interface ApiError {
  response?: {
    data?: { message?: string; retry_after?: number | null; code?: string };
  };
}

const RESEND_SECONDS = 60;

export function VerifyEmailClient() {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [code, setCode] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sendMutation = useSendVerificationCodeMutation();
  const verifyMutation = useVerifyEmailMutation();
  // Sayfa acilisinda kod gonderimi bir kez tetiklensin (React 18 strict mode
  // effect'i iki kez calistirir; sunucudaki 60 sn kilidi de var ama bosuna
  // ikinci istek atmayalim).
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!Cookies.get(AUTH_TOKEN_KEY)) {
      router.replace(ROUTES.LOGIN);
    }
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const requestCode = (resend: boolean) => {
    setError(null);
    sendMutation.mutate(resend, {
      onSuccess: (data) => {
        if (data?.email_verified) {
          setVerified(true);
          return;
        }
        setInfo(t("verify_email_sent"));
        setCooldown(data?.retry_after ?? RESEND_SECONDS);
      },
      onError: (err) => {
        const res = (err as ApiError)?.response?.data;
        // 429 "cooldown": kod zaten gonderilmis (or. kayit ekranindan gelindi).
        if (res?.code === "cooldown" && res.retry_after) {
          setInfo(t("verify_email_sent"));
          setCooldown(res.retry_after);
          return;
        }
        setError(res?.message || commonT("error"));
      },
    });
  };

  useEffect(() => {
    if (bootstrapped.current) return;
    if (!Cookies.get(AUTH_TOKEN_KEY)) return;
    bootstrapped.current = true;
    requestCode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setError(t("verify_email_required"));
      return;
    }

    verifyMutation.mutate(
      { code: trimmed },
      {
        onSuccess: () => {
          setVerified(true);
          setInfo(null);
          setTimeout(() => router.push(ROUTES.PROFILE), 1500);
        },
        onError: (err) => {
          setError((err as ApiError)?.response?.data?.message || commonT("error"));
        },
      }
    );
  };

  if (verified) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-green-600" />
          <h1 className="text-2xl font-bold">{t("verify_email_success")}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <MailCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">{t("verify_email_title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("verify_email_subtitle", { email: user?.email ?? "" })}
          </p>
        </div>

        {info && !error && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t("verify_email_code")}</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <Button type="submit" className="w-full" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? commonT("loading") : t("verify_email_submit")}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={cooldown > 0 || sendMutation.isPending}
            onClick={() => requestCode(true)}
          >
            {cooldown > 0
              ? t("verify_email_resend_in", { seconds: cooldown })
              : t("verify_email_resend")}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t("verify_email_spam_hint")}
        </p>
      </div>
    </div>
  );
}
