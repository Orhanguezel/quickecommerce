'use client';

import Loader from '@/components/molecules/Loader';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { env } from '@/env.mjs';
import { persistAdminAuthSession, type AdminAuthSession } from '@/lib/admin-auth-session';
import { authorizationAtom } from '@/lib/authorization-atom';
import { useRouter } from '@/routing';
import axios from 'axios';
import { useSetAtom } from 'jotai';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: 'Google giriş isteği geçersiz veya süresi dolmuş.',
  email_not_verified: 'Google hesabının e-posta adresi doğrulanmamış.',
  not_authorized: 'Bu Google hesabının admin giriş izni yok.',
  provider_failed: 'Google ile bağlantı kurulamadı.',
};

export default function AdminGoogleCallbackPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const router = useRouter();
  const setAuthorized = useSetAtom(authorizationAtom);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error || !code) {
      toast.error(ERROR_MESSAGES[error ?? ''] ?? 'Google admin girişi tamamlanamadı.');
      router.replace(Routes.signin);
      return;
    }

    axios
      .post<AdminAuthSession>(
        `${env.NEXT_PUBLIC_REST_API_ENDPOINT}${API_ENDPOINTS.ADMIN_GOOGLE_EXCHANGE}`,
        { code },
        { headers: { 'X-localization': locale } }
      )
      .then(({ data }) => {
        persistAdminAuthSession(data);
        setAuthorized(true);
        toast.success('Google hesabıyla admin girişi başarılı.');
        router.replace(Routes.dashboard);
      })
      .catch(() => {
        toast.error('Google giriş kodu geçersiz veya süresi dolmuş.');
        router.replace(Routes.signin);
      });
  }, [locale, router, searchParams, setAuthorized]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
      <Loader size="large" />
      <p className="text-sm text-gray-600 dark:text-gray-300">Google admin girişi tamamlanıyor…</p>
    </div>
  );
}
