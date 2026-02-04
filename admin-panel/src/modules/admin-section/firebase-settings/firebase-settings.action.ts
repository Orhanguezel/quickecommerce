// import { useMediaAddService } from "./product.service";

import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { useFirebaseSettingsService } from './firebase-settings.service';
import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { useQuery } from '@tanstack/react-query';
import { FirebaseSettingsQueryOptions } from './firebase-settings.type';

export const useFirebaseSettingsQuery = (options: Partial<FirebaseSettingsQueryOptions>) => {
  const { findAll } = useFirebaseSettingsService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.FIREBASE_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    FirebaseSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useJSONFileUploadService = () => {
  const locale = useLocale();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.NEXT_PUBLIC_REST_API_ENDPOINT,
      timeout: 5000000,
      headers: {
        'Content-Type': 'multipart/form-data', // Ensure multipart for file uploads
      },
    });

    instance.interceptors.request.use((config) => {
      const cookies = Cookies.get(AUTH_TOKEN_KEY);
      let token = cookies || '';

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        'X-localization': locale,
      } as unknown as AxiosRequestHeaders;

      return config;
    });

    return instance;
  }, [locale]);

  const uploadJSONFile = async (file: File, route: string) => {
    const formData = new FormData();
    formData.append('firebase_json_file', file);

    try {
      const response = await axiosInstance.post(route, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    uploadJSONFile,
  };
};
