import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY, AUTH_USER } from '@/lib/constants';
import { type ApiResponse, type SearchParamOptions } from '@/types';
import axios, { AxiosRequestConfig, type AxiosRequestHeaders, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { toast } from 'react-toastify';

type Subscriber = (token: string) => void;
let isRefreshing = false;
let queue: Subscriber[] = [];

const subscribe = (cb: Subscriber) => queue.push(cb);
const notifySubscribers = (token: string) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

const sanitizeParams = (params: unknown) => {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return params;
  return Object.fromEntries(
    Object.entries(params as Record<string, unknown>).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    }),
  );
};

import { usePathname } from 'next/navigation'; // Add this

export const useBaseService = <DataType, InputType = unknown>(route: string) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.NEXT_PUBLIC_REST_API_ENDPOINT,
      timeout: 5000000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.request.use((config) => {
      const hasFile = config.data && config.data.multipart === true;

      const cookies = Cookies.get(AUTH_TOKEN_KEY);
      const token = cookies || '';

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        'X-localization': locale,
        'Content-Type': hasFile ? 'multipart/form-data' : 'application/json',
      } as unknown as AxiosRequestHeaders;
      config.params = sanitizeParams(config.params);

      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config || {};

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.endsWith('/refresh-token')
        ) {
          originalRequest._retry = true;

          const oldToken = Cookies.get(AUTH_TOKEN_KEY) || '';

          if (!oldToken) {
            if (pathname?.startsWith('/admin')) {
              router.push('/admin/signin');
            } else if (pathname?.startsWith('/seller')) {
              router.push('/seller/signin');
            } else {
              router.push('/');
            }

            return Promise.reject(error);
          }

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              subscribe((newToken) => {
                if (!newToken) return reject(error);
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${newToken}`,
                };
                resolve(instance(originalRequest));
              });
            });
          }

          isRefreshing = true;

          try {
            const refreshResp = await axios.post(
              `${env.NEXT_PUBLIC_REST_API_ENDPOINT}/refresh-token`,
              null,
              {
                headers: {
                  Authorization: `Bearer ${oldToken}`,
                },
              },
            );

            const { token: newToken, new_expires_at } = refreshResp.data ?? {};
            if (!newToken) throw new Error('No new token returned');

            Cookies.set(AUTH_TOKEN_KEY, newToken);
            if (new_expires_at) localStorage.setItem('expires_at', new_expires_at);

            instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            notifySubscribers(newToken);

            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            };

            return instance(originalRequest);
          } catch (refreshError) {
            notifySubscribers('');
            Cookies.remove(AUTH_TOKEN_KEY);
            Cookies.remove(AUTH_USER);
            toast.error('Session expired, please sign in again.');

            // 🔁 Redirect again here as fallback
            if (pathname?.startsWith('/admin')) {
              router.push('/admin/signin');
            } else if (pathname?.startsWith('/seller')) {
              router.push('/seller/signin');
            } else {
              router.push('/');
            }

            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );

    return instance;
  }, [locale, pathname, router]);

  const findAll = useCallback(
    (params?: unknown) => {
      return axiosInstance.get<DataType[]>(route, { params: sanitizeParams(params) });
    },
    [axiosInstance, route],
  );

  const findAllByPost = (data?: unknown) => {
    return axiosInstance.post<DataType[]>(route, data);
  };

  const find = useCallback(
    (id: string, store_id?: string) =>
      axiosInstance.get<DataType>(`${route}/${id}`, {
        params: { store_id },
      }),
    [axiosInstance, route],
  );

  const findPageBySlug = (slug: string, params?: unknown) =>
    axiosInstance.get<DataType>(`${route}/${slug}`, { params: sanitizeParams(params) });
  const findByStore = useCallback(
    (id: string, store_id?: string) => {
      return axiosInstance.get<DataType>(`${route}/${id}`, {
        params: store_id ? { store_id } : undefined, // Include store_id if provided
      });
    },
    [axiosInstance, route],
  );

  const create = (data: Record<string, unknown>) => {
    return axiosInstance.post<InputType, AxiosResponse<DataType>>(route, data);
  };
  const update = (data: Record<string, unknown>) => {
    return axiosInstance.put<InputType, AxiosResponse<DataType>>(route, data);
  };
  const patchItem = (data: Record<string, unknown>) => {
    return axiosInstance.patch<DataType>(route, data);
  };

  const postEmpty = () => {
    return axiosInstance.post<InputType, AxiosResponse<DataType>>(route);
  };

  const deleteItem = (id: string) => {
    return axiosInstance.delete<DataType>(`${route}/${id}`);
  };
  const postItem = (id: string) => {
    return axiosInstance.post<DataType>(`${route}/${id}`);
  };
  const putItem = (id: string) => {
    return axiosInstance.put<DataType>(`${route}/${id}`);
  };
  const formatData = (data: DataType[] | undefined) => {
    const response: unknown = data;
    const responseData = response as ApiResponse<DataType>;
    const items: DataType[] = responseData?.data;
    return items;
  };

  const formatSearchParams = (params: Partial<SearchParamOptions>) => {
    return Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([k, v]) =>
        ['type', 'categories', 'tags', 'author', 'manufacturer', 'shops'].includes(k)
          ? `${k}.slug:${v}`
          : `${k}:${v}`,
      )
      .join(';');
  };

  return {
    findAll,
    findAllByPost,
    find,
    findPageBySlug,
    findByStore,
    create,
    postEmpty,
    update,
    patchItem,
    postItem,
    putItem,
    delete: deleteItem,
    formatData,
    formatSearchParams,
    getAxiosInstance: () => axiosInstance,
  };
};
