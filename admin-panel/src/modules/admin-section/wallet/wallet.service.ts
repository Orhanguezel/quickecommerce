import { SELLER_API_ENDPOINTS } from '@/endpoints/SellerApiEndPoints';
import { useBaseService } from '@/modules/core/base.service';
import { Wallet, walletStatus } from './wallet.type';

import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios, { type AxiosRequestHeaders, type AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { toast } from 'react-toastify';

export const useWalletQueryService = () => {
  return useBaseService<Wallet>(API_ENDPOINTS.WALLET_LIST);
};
export const useWalletStatusUpdateService = () => {
  return useBaseService<walletStatus, any>(API_ENDPOINTS.WALLET_STATUS_UPDATE);
};

export const useTransactionsQueryService = () => {
  return useBaseService<Wallet>(API_ENDPOINTS.WALLET_TRANSACTIONS);
};

export const useTransactionHistoryStatusUpdateService = () => {
  return useBaseService<walletStatus, any>(API_ENDPOINTS.TRANSACTIONS_STATUS_UPDATE);
};
export const usePaymentStatusUpdateService = () => {
  return useBaseService<walletStatus, any>(API_ENDPOINTS.TRANSACTIONS_PAYMENT_STATUS_UPDATE);
};

export const useDepositService = () => {
  return useBaseService<any>(API_ENDPOINTS.WALLET_AMOUNT_DEPOSIT);
};

export const useSubscriptionToCommissionService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.BUSINESS_PLAN_CHANGE);
};
export const useWalletPaymentStatusUpdateService = () => {
  return useBasePaymentService<any>(SELLER_API_ENDPOINTS.WALLET_STATUS_UPDATE);
};
export const usePackageRenewService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.PACKAGE_RENEW);
};
export const useBuyPackageService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.BUY_PACKAGE);
};

export const useBasePaymentService = <DataType, InputType = unknown>(route: string) => {
  const locale = useLocale();
  const UserEmail = localStorage.getItem('user_email') || '';

  const secretKey = '4b3403665fea6e60060fca1953b6e1eaa5c4dc102174f7e923217b87df40523a';
  const xHmac = generateHmac(secretKey, UserEmail);

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.NEXT_PUBLIC_REST_API_ENDPOINT,
      timeout: 5000000,
      headers: {
        'Content-Type': 'application/json',
        'X-HMAC': xHmac,
      },
    });

    instance.interceptors.request.use((config) => {
      const hasFile =
        config.data &&
        (Object.values(config.data).some(
          (value) => value instanceof File || value instanceof Blob,
        ) ||
          config.data.multipart === true);

      const cookies = Cookies.get(AUTH_TOKEN_KEY);
      const token = cookies || '';

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        'X-localization': locale,
        'X-HMAC': xHmac,
        'Content-Type': hasFile ? 'multipart/form-data' : 'application/json',
      } as unknown as AxiosRequestHeaders;

      return config;
    });

    return instance;
  }, [locale, xHmac]);

  if (!UserEmail) {
    toast.warn('User email is not defined. Service will not be initialized.');
    return null;
  }

  const create = (data: Record<string, unknown>) => {
    return axiosInstance.post<InputType, AxiosResponse<DataType>>(route, data);
  };

  return {
    create,
    getAxiosInstance: () => axiosInstance,
  };
};

const generateHmac = (secretKey: string, email: string) => {
  const hmac = CryptoJS.HmacSHA256(email, secretKey);

  return hmac.toString(CryptoJS.enc.Hex);
};
