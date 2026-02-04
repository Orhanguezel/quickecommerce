import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { SELLER_API_ENDPOINTS } from '@/endpoints/SellerApiEndPoints';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  useRequestApproveService,
  useRequestDetailsService,
  useRequestQueryService,
  useRequestRejectService,
  useWithdrawMethodDropdownQueryService,
} from './request.service';
import { RequestQueryOptions } from './request.type';

import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';

export const useRequestQuery = (options: Partial<RequestQueryOptions>) => {
  const { findAll } = useRequestQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.WITHDRAW_REQUEST_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  useEffect(() => {
    //@ts-ignore
    const errorToast = error?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    Requests: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useRequestDetailsQueryById = (id: string) => {
  const { find } = useRequestDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.WITHDRAW_REQUEST_DETAILS, id],
    queryFn: () => find(id),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
  useEffect(() => {
    //@ts-ignore
    const errorToast = error?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    RequestDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useWithdrawMethodDropdownQuery = (options: Partial<RequestQueryOptions>) => {
  const { findAll } = useWithdrawMethodDropdownQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.WITHDRAW_METHOD_DROPDOWN],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    WithdrawMethodList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useFileUploadService = () => {
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

  const uploadFile = async (file: File, id: string, route: string) => {
    // Validate file type
    const allowedFileTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/zip',
      'application/pdf',
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf',
      'application/octet-stream',
    ];

    if (!allowedFileTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed types are: .jpg, .png, .jpeg, .webp, .zip, .pdf');
    }

    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('id', id); // Append id

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

export const useRequestApproveMutation = () => {
  const { create } = useRequestApproveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.WITHDRAW_REQUEST_APPROVE],
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
export const useRequestRejectMutation = () => {
  const { create } = useRequestRejectService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.WITHDRAW_REQUEST_REJECT],
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
