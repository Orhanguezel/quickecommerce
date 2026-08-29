import { setAuthCredentials } from '@/lib/auth-utils';
import { AUTH_TOKEN_KEY, AUTH_USER } from '@/lib/constants';
import Cookies from 'js-cookie';

export type AdminAuthSession = {
  token: string;
  expires_at?: string;
  permissions?: string[];
};

export function persistAdminAuthSession(session: AdminAuthSession) {
  Cookies.set(AUTH_TOKEN_KEY, session.token);
  Cookies.set(AUTH_USER, 'system_level');
  setAuthCredentials(session.token, session.permissions ?? []);

  if (session.expires_at) {
    localStorage.setItem('expires_at', session.expires_at);
  }

  localStorage.setItem('selectedStore', JSON.stringify({ id: '', slug: '' }));
}
