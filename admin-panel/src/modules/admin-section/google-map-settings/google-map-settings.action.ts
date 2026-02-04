// import { useMediaAddService } from "./product.service";
import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { GoogleMapSettingsFormData } from './google-map-settings.schema';
import {
  useGoogleMapForAllService,
  useGoogleMapSettingsMutionsService,
  useGoogleMapSettingsService,
} from './google-map-settings.service';
import { GoogleMapSettingsQueryOptions } from './google-map-settings.type';

export const useGoogleMapForAllQuery = (options: Partial<GoogleMapSettingsQueryOptions>) => {
  const { findAll } = useGoogleMapForAllService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.GOOGLE_MAP_FOR_ALL],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    GoogleMapData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useGoogleMapSettingsQuery = (options: Partial<GoogleMapSettingsQueryOptions>) => {
  const { findAll } = useGoogleMapSettingsService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.GOOGLE_MAP_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    GoogleMapSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for creating a new brand
export const useGoogleMapSettingsStoreMutation = () => {
  const { create } = useGoogleMapSettingsMutionsService();

  return useMutation({
    mutationFn: (values: GoogleMapSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.GOOGLE_MAP_SETTINGS],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
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
