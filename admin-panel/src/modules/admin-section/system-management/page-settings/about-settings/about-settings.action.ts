import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { AboutSettingsFormData } from "./about-settings.schema";
import { useAboutSettingsQueryService, usePageUpdateService } from "./about-settings.service";
import { AboutSettingsQueryOptions } from "./about-settings.type";
import { Routes } from "@/config/routes";


export const useAboutSettingsQuery = (options: Partial<AboutSettingsQueryOptions>) => {
  const { findAll } = useAboutSettingsQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ABOUT_SETTINGS],
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
    AboutSettings: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAboutSettingsStoreMutation = () => {

  const { create } = useAboutSettingsQueryService();
  return useMutation({
    mutationFn: (values: AboutSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ABOUT_SETTINGS],
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

export const useAboutPageUpdateMutation = () => {
  const { create } = usePageUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: AboutSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.PAGES_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.pages);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data;
      if (errorText && typeof errorText === "object") {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};

