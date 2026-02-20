import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

let currentToken = Cookies.get(AUTH_TOKEN_KEY) || '';
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

export const getCurrentToken = () => currentToken;

export const refreshToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push((newToken) => resolve(newToken));
    });
  }

  isRefreshing = true;

  try {
    const refreshResponse = await axios.post<{
      token: string;
      expires_at: string;
    }>(
      `${env.NEXT_PUBLIC_REST_API_ENDPOINT}/refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const newToken = refreshResponse.data.token;
    const newExpiresAt = refreshResponse.data.expires_at;

    if (newToken && newExpiresAt) {
      Cookies.set(AUTH_TOKEN_KEY, newToken);
      localStorage.setItem('token_expires_at', newExpiresAt);
      currentToken = newToken;

      // Process all queued requests
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      return newToken;
    }
    return null;
  } catch (error) {
    toast.error(
      error instanceof Error
        ? `Error refetching data: ${error.message}`
        : 'An unknown error occurred while refetching data',
    );
    Cookies.remove(AUTH_TOKEN_KEY);
    localStorage.removeItem('token_expires_at');
    throw error;
  } finally {
    isRefreshing = false;
  }
};

export const checkTokenExpiration = async (): Promise<string> => {
  const expiresAtStr = localStorage.getItem('token_expires_at') || localStorage.getItem('expires_at');
  if (!expiresAtStr) return currentToken;

  const expiresAt = new Date(expiresAtStr.replace(' ', 'T') + 'Z');
  const nowUtc = new Date();
  const minutesLeft = (expiresAt.getTime() - nowUtc.getTime()) / 1000 / 60;

  if (minutesLeft <= 0) {
    try {
      const newToken = await refreshToken();
      return newToken || currentToken;
    } catch {
      return currentToken;
    }
  }

  return currentToken;
};
