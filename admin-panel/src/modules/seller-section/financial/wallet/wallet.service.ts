import { SELLER_API_ENDPOINTS } from '@/endpoints/SellerApiEndPoints';
import { useBaseService } from '@/modules/core/base.service';
import { GenerateWalletHMACQueryOptions, Wallet } from './wallet.type';

import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import { type ApiResponse, type SearchParamOptions } from '@/types';
import axios, { type AxiosResponse, type AxiosInstance, type AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';
import CryptoJS from 'crypto-js';

export const useWalletQueryService = () => {
  return useBaseService<Wallet>(SELLER_API_ENDPOINTS.WALLET_LIST);
};
export const useTransactionsQueryService = () => {
  return useBaseService<Wallet>(SELLER_API_ENDPOINTS.WALLET_TRANSACTIONS);
};
export const useDepositService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.WALLET_AMOUNT_DEPOSIT);
};

export const useSubscriptionToCommissionService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.BUSINESS_PLAN_CHANGE);
};
export const useWalletPaymentStatusUpdateService = (xHmac: string) => {
  return useBasePaymentService<any>(SELLER_API_ENDPOINTS.WALLET_STATUS_UPDATE, xHmac);
};
export const usePackageRenewService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.PACKAGE_RENEW);
};
export const useBuyPackageService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.BUY_PACKAGE);
};

export const useBasePaymentService = <DataType, InputType = unknown>(
  route: string,
  xHmac: string,
) => {
  const locale = useLocale();

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

  const create = (data: Record<string, unknown>) => {
    return axiosInstance.post<InputType, AxiosResponse<DataType>>(route, data);
  };

  return {
    create,
    getAxiosInstance: () => axiosInstance,
  };
};

export const useGenerateWalletHMACService = () => {
  return useBaseService<GenerateWalletHMACQueryOptions>(SELLER_API_ENDPOINTS.GENERATE_WALLET_HMAC);
};
