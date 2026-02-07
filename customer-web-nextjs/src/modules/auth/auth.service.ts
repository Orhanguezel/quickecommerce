"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { env } from "@/env.mjs";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
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
} from "./auth.type";

const api = axios.create({
  baseURL: env.NEXT_PUBLIC_REST_API_ENDPOINT,
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
      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo || `/${locale}`);
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
    onSuccess: (data) => {
      Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: 30 });
      Cookies.set(AUTH_USER, JSON.stringify(data.user), { expires: 30 });
      if (data.expires_at) {
        localStorage.setItem("expires_at", data.expires_at);
      }
      setUser(data.user);
      router.push(`/${locale}`);
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
