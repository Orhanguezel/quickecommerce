"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { toast } from "@/hooks/use-toast";
import { getApiBaseUrl } from "@/lib/api-url";
import { AUTH_TOKEN_KEY, AUTH_USER } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  ForgotPasswordInput,
  VerifyTokenInput,
  ResetPasswordInput,
  SocialLoginInput,
  OtpLoginSendInput,
  OtpLoginSendResponse,
  OtpLoginVerifyInput,
  VerifyEmailInput,
  VerificationCodeResponse,
  User,
} from "./auth.type";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export function useLoginMutation() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, data, {
        headers: { "X-localization": locale },
      });
      return res.data;
    },
    onSuccess: (data) => {
      Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 30 });
      Cookies.set(AUTH_USER, JSON.stringify(data.user), { expires: 30 });
      if (data.expires_at) {
        localStorage.setItem("expires_at", data.expires_at);
      }
      setUser(data.user);
      toast({
        title: "Giriş başarılı",
        description: "Hesabınıza giriş yapıldı.",
      });
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo || `/${locale}`);
    },
  });
}

export interface GuestCheckoutInput {
  email: string;
  first_name: string;
  last_name?: string;
  phone: string;
  /** E-posta dogrulama kodu (misafir dogrulamasi acikken zorunlu). */
  code?: string;
}

interface GuestCheckoutResponse {
  status: boolean;
  token: string;
  email: string;
  is_guest: boolean;
  message?: string;
  code?: string;
}

export interface GuestCodeInput {
  email: string;
  first_name?: string;
  phone?: string;
}

export interface GuestCodeResponse {
  status: boolean;
  /** false ise sunucuda misafir dogrulamasi kapali; kod adimi atlanir. */
  verification_required?: boolean;
  retry_after?: number | null;
  message?: string;
  code?: string;
}

// Misafir checkout icin e-postaya 6 haneli kod gonderir.
export function useGuestCheckoutSendCodeMutation() {
  const locale = useLocale();

  return useMutation({
    mutationFn: async (data: GuestCodeInput) => {
      const res = await api.post<GuestCodeResponse>(
        API_ENDPOINTS.GUEST_CHECKOUT_SEND_CODE,
        data,
        { headers: { "X-localization": locale } }
      );
      return res.data;
    },
  });
}

// Misafir (guest) checkout: üyeliksiz sipariş. Hafif hesap + token alır,
// login gibi oturum açar ve ödeme sayfasına yönlendirir.
export function useGuestCheckoutMutation() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: GuestCheckoutInput) => {
      const res = await api.post<GuestCheckoutResponse>(
        API_ENDPOINTS.GUEST_CHECKOUT,
        data,
        { headers: { "X-localization": locale } }
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 7 });
      const guestUser = {
        email: data.email,
        first_name: variables.first_name,
        last_name: variables.last_name ?? "",
        phone: variables.phone,
        is_guest: true,
      } as unknown as User;
      Cookies.set(AUTH_USER, JSON.stringify(guestUser), { expires: 7 });
      setUser(guestUser);
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo || `/${locale}/odeme`);
    },
  });
}

export function useRegisterMutation() {
  const locale = useLocale();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await api.post<RegisterResponse>(API_ENDPOINTS.REGISTER, data, {
        headers: { "X-localization": locale },
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 30 });
      // Backend kayit yanitinda `user` nesnesi dondurmuyor; forma girilen
      // bilgilerden kur ki hesap menusu/dogrulama ekrani bos kalmasin.
      const user = (data.user ?? {
        email: data.email ?? variables.email,
        first_name: variables.first_name,
        last_name: variables.last_name,
        phone: variables.phone,
      }) as User;
      Cookies.set(AUTH_USER, JSON.stringify(user), { expires: 30 });
      if (data.expires_at) {
        localStorage.setItem("expires_at", data.expires_at);
      }
      setUser(user);

      // E-posta dogrulamasi aciksa once kod ekranina.
      if (data.email_verification_settings === "on" && !data.email_verified) {
        router.push(`/${locale}${ROUTES.VERIFY_EMAIL}`);
        return;
      }

      router.push(`/${locale}`);
    },
  });
}

// --- Uyelik e-posta dogrulamasi (6 haneli kod) ------------------------------

function authHeaders(locale: string) {
  return {
    Authorization: `Bearer ${Cookies.get(AUTH_TOKEN_KEY) || ""}`,
    "X-localization": locale,
  };
}

/** Oturum acmis musterinin kendi adresine dogrulama kodu gonderir. */
export function useSendVerificationCodeMutation() {
  const locale = useLocale();
  return useMutation({
    mutationFn: async (resend: boolean = false) => {
      const res = await api.post<VerificationCodeResponse>(
        resend
          ? API_ENDPOINTS.RESEND_VERIFICATION_EMAIL
          : API_ENDPOINTS.SEND_VERIFICATION_EMAIL,
        {},
        { headers: authHeaders(locale) }
      );
      return res.data;
    },
  });
}

/** Kodu dogrular; basarili olursa hesap dogrulanmis olur. */
export function useVerifyEmailMutation() {
  const locale = useLocale();
  return useMutation({
    mutationFn: async (data: VerifyEmailInput) => {
      const res = await api.post<VerificationCodeResponse>(
        API_ENDPOINTS.VERIFY_EMAIL,
        data,
        { headers: authHeaders(locale) }
      );
      return res.data;
    },
  });
}

export function useSocialLoginMutation() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: SocialLoginInput) => {
      const res = await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
        ...data,
        social_login: true,
        role: "customer",
        platform: "web",
      }, {
        headers: { "X-localization": locale },
      });
      return res.data;
    },
    onSuccess: (data) => {
      Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 30 });
      Cookies.set(AUTH_USER, JSON.stringify(data.user), { expires: 30 });
      if (data.expires_at) {
        localStorage.setItem("expires_at", data.expires_at);
      }
      setUser(data.user);
      toast({
        title: "Giriş başarılı",
        description: "Hesabınıza giriş yapıldı.",
      });
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo || `/${locale}`);
    },
  });
}

interface AuthPayloadCandidate {
  token?: string;
  expires_at?: string;
  user?: User;
  data?: {
    token?: string;
    expires_at?: string;
    user?: User;
  };
}

function extractAuthPayload(data: AuthPayloadCandidate) {
  if (data?.token && data?.user) {
    return {
      token: data.token,
      user: data.user,
      expires_at: data.expires_at,
    };
  }
  if (data?.data?.token && data?.data?.user) {
    return {
      token: data.data.token,
      user: data.data.user,
      expires_at: data.data.expires_at,
    };
  }
  return null;
}

function persistAuthAndRedirect(
  payload: { token: string; user: User; expires_at?: string },
  setUser: (user: User) => void,
  locale: string,
  router: ReturnType<typeof useRouter>,
  redirectTo?: string | null
) {
  Cookies.set(AUTH_TOKEN_KEY, payload.token, { expires: 30 });
  Cookies.set(AUTH_USER, JSON.stringify(payload.user), { expires: 30 });
  if (payload.expires_at) {
    localStorage.setItem("expires_at", payload.expires_at);
  }
  setUser(payload.user);
  router.push(redirectTo || `/${locale}`);
}

export function useOtpLoginSendMutation() {
  const locale = useLocale();
  return useMutation({
    mutationFn: async (data: OtpLoginSendInput) => {
      const res = await api.post<OtpLoginSendResponse>(
        API_ENDPOINTS.OTP_LOGIN_SEND,
        data,
        {
          headers: { "X-localization": locale },
        }
      );
      return res.data;
    },
  });
}

export function useOtpLoginResendMutation() {
  const locale = useLocale();
  return useMutation({
    mutationFn: async (data: OtpLoginSendInput) => {
      const res = await api.post<OtpLoginSendResponse>(
        API_ENDPOINTS.OTP_LOGIN_RESEND,
        data,
        {
          headers: { "X-localization": locale },
        }
      );
      return res.data;
    },
  });
}

export function useOtpLoginVerifyMutation() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: OtpLoginVerifyInput) => {
      const res = await api.post<AuthPayloadCandidate>(
        API_ENDPOINTS.OTP_LOGIN_VERIFY,
        data,
        {
          headers: { "X-localization": locale },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      const payload = extractAuthPayload(data);
      if (!payload) return;
      const redirectTo = searchParams.get("redirect");
      persistAuthAndRedirect(payload, setUser, locale, router, redirectTo);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const res = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, data);
      return res.data;
    },
  });
}

export function useVerifyTokenMutation() {
  return useMutation({
    mutationFn: async (data: VerifyTokenInput) => {
      const res = await api.post(API_ENDPOINTS.VERIFY_TOKEN, data);
      return res.data;
    },
  });
}

export function useResetPasswordMutation() {
  const locale = useLocale();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const res = await api.patch(API_ENDPOINTS.RESET_PASSWORD, data);
      return res.data;
    },
    onSuccess: () => {
      router.push(`/${locale}/giris`);
    },
  });
}

export function useLogout() {
  const locale = useLocale();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return async () => {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    try {
      if (token) {
        await api.post(API_ENDPOINTS.LOGOUT, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore
    } finally {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(AUTH_USER);
      localStorage.removeItem("expires_at");
      logout();
      router.push(`/${locale}`);
    }
  };
}
