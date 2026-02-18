import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { SELLER_API_ENDPOINTS } from '@/endpoints/SellerApiEndPoints';
import { SellerRoutes } from '@/config/sellerRoutes';
import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { ProductFormData } from './product.schema';
import {
  useAltChangeService,
  useCouponLineDeleteService,
  useDynamicFieldService,
  useMakeFeatureService,
  useMediaDeleteService,
  useMediaLibraryService,
  useProductDescriptionGenerateService,
  useProductEditService,
  useProductQueryService,
  useProductStoreService,
  useProductUpdateService,
  useStoreListService,
} from './product.service';
import { altChangeData, mediaDeleteData, ProductQueryOptions } from './product.type';

export const useStoreListQuery = (
  options: Partial<ProductQueryOptions>,
  config?: { skip: boolean },
) => {
  const { findAll } = useStoreListService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.STORE_DROPDOWN_LIST, options],
    queryFn: () => findAll(options),
    enabled: !config?.skip,
    ...options,
  });

  return {
    stores: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useProductQuery = (options: Partial<ProductQueryOptions>) => {
  const { findAll } = useProductQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.PRODUCT_LIST, options],
    queryFn: () => findAll(options),
    enabled: !!options?.store_id,
    ...options,
  });
  return {
    productList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useProductQueryById = (id: string) => {
  const { find } = useProductEditService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.PRODUCT_EDIT, id],
    queryFn: () => find(id),
    enabled: !!id,
  });
  return {
    product: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useProductStoreMutation = () => {
  const router = useRouter();
  const { create } = useProductStoreService();
  return useMutation({
    mutationFn: (values: ProductFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.PRODUCT_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.productList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error('An unknown error occurred.');
      }
    },
  });
};
export const useProductUpdateMutation = () => {
  const router = useRouter();
  const { update } = useProductUpdateService();
  return useMutation({
    mutationFn: (values: ProductFormData) => update(values),
    mutationKey: [SELLER_API_ENDPOINTS.PRODUCT_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.productList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};

export const useProductDelete = () => {
  const { delete: deleteItem } = useCouponLineDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [SELLER_API_ENDPOINTS.PRODUCT_REMOVE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};

export const useMakeFeature = () => {
  const { create } = useMakeFeatureService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.PRODUCT_FEATURE_MAKE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};

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

  const uploadFile = async (file: File, route: string) => {
    const formData = new FormData();
    formData.append('file', file);

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
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
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
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};

export const useDynamicFieldQuery = (options: Partial<any>) => {
  const { findAll } = useDynamicFieldService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.PRODUCT_DYNAMIC_FIELD, options?.store_type],
    queryFn: () => findAll(options),
    enabled: !!options?.store_type,
  });

  return {
    DynamicFieldList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useProductDescriptionGenerate = () => {
  const { create } = useProductDescriptionGenerateService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.PRODUCT_DESCRIPTION_GENERATE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText && typeof errorText === 'object') {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === 'string') {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};
