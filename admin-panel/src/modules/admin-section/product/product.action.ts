import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import {
  useAltChangeService,
  useMediaDeleteService,
  useMediaLibraryService,
} from './product.service';
import { altChangeData, mediaDeleteData, ProductQueryOptions } from './product.type';

export const useFileUploadService = () => {
  const locale = useLocale();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.NEXT_PUBLIC_REST_API_ENDPOINT,
      timeout: 5000000,
      headers: {
        'Content-Type': 'multipart/form-data',
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

  const uploadFile = async (file: File, route: string, store_id: string, usage_type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('store_id', store_id);
    formData.append('usage_type', usage_type);

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
    uploadFile,
  };
};

export const useMediaLibraryQuery = (options: Partial<ProductQueryOptions>) => {
  const { findAll } = useMediaLibraryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PRODUCT_MEDIA_LIBRARY],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    mediaLibrary: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useMediaDelete = () => {
  const { create } = useMediaDeleteService();
  return useMutation({
    mutationFn: (values: mediaDeleteData) => create(values),
    mutationKey: [API_ENDPOINTS.PRODUCT_MEDIA_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useAltChange = () => {
  const { create } = useAltChangeService();
  return useMutation({
    mutationFn: (values: altChangeData) => create(values),
    mutationKey: [API_ENDPOINTS.PRODUCT_ALT_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
