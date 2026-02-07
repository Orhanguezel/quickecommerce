"use client";

import { env } from "@/env.mjs";
import { AUTH_TOKEN_KEY, AUTH_USER } from "@/lib/constants";
import { type ApiResponse, type SearchParamOptions } from "@/types";
import axios, {
  AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
} from "axios";
import Cookies from "js-cookie";
import { useLocale } from "next-intl";
import { useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

type Subscriber = (token: string) => void;
let isRefreshing = false;
let queue: Subscriber[] = [];

const subscribe = (cb: Subscriber) => queue.push(cb);
const notifySubscribers = (token: string) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

export const useBaseService = <DataType, InputType = unknown>(
  route: string
) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: env.NEXT_PUBLIC_REST_API_ENDPOINT,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use((config) => {
      const token = Cookies.get(AUTH_TOKEN_KEY) || "";

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        "X-localization": locale,
      } as unknown as AxiosRequestHeaders;

      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
          error.config || {};

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.endsWith("/customer/refresh-token")
        ) {
          originalRequest._retry = true;

          const oldToken = Cookies.get(AUTH_TOKEN_KEY) || "";

          if (!oldToken) {
            router.push(`/${locale}/giris`);
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
              `${env.NEXT_PUBLIC_REST_API_ENDPOINT}/customer/refresh-token`,
              null,
              {
                headers: {
                  Authorization: `Bearer ${oldToken}`,
                },
              }
            );

            const { token: newToken, new_expires_at } =
              refreshResp.data ?? {};
            if (!newToken) throw new Error("No new token returned");

            Cookies.set(AUTH_TOKEN_KEY, newToken);
            if (new_expires_at)
              localStorage.setItem("expires_at", new_expires_at);

            instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            notifySubscribers(newToken);

            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            };

            return instance(originalRequest);
          } catch {
            notifySubscribers("");
            Cookies.remove(AUTH_TOKEN_KEY);
            Cookies.remove(AUTH_USER);
            router.push(`/${locale}/giris`);
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [locale, pathname, router]);

  const findAll = useCallback(
    (params?: unknown) => {
      return axiosInstance.get<DataType[]>(route, { params });
    },
    [axiosInstance, route]
  );

  const find = useCallback(
    (id: string, params?: unknown) =>
      axiosInstance.get<DataType>(`${route}/${id}`, { params }),
    [axiosInstance, route]
  );

  const findBySlug = useCallback(
    (slug: string, params?: unknown) =>
      axiosInstance.get<DataType>(`${route}/${slug}`, { params }),
    [axiosInstance, route]
  );

  const create = (data: Record<string, unknown>) => {
    return axiosInstance.post<InputType, AxiosResponse<DataType>>(route, data);
  };

  const update = (data: Record<string, unknown>) => {
    return axiosInstance.put<InputType, AxiosResponse<DataType>>(route, data);
  };

  const patch = (data: Record<string, unknown>) => {
    return axiosInstance.patch<DataType>(route, data);
  };

  const deleteItem = (id: string) => {
    return axiosInstance.delete<DataType>(`${route}/${id}`);
  };

  const formatData = (data: DataType[] | undefined) => {
    const response: unknown = data;
    const responseData = response as ApiResponse<DataType>;
    return responseData?.data;
  };

  return {
    findAll,
    find,
    findBySlug,
    create,
    update,
    patch,
    delete: deleteItem,
    formatData,
    getAxiosInstance: () => axiosInstance,
  };
};
