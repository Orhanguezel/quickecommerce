import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { GDPRCookieSettingsFormData } from "./gdpr-cookie-settings.schema";
import { useGDPRCookieSettingsQueryService, useGDPRCookieSettingsStoreService } from "./gdpr-cookie-settings.service";
import { GDPRCookieSettingsQueryOptions } from "./gdpr-cookie-settings.type";

export const useGDPRCookieSettingsQuery = (options: Partial<GDPRCookieSettingsQueryOptions>) => {
  const { findAll } = useGDPRCookieSettingsQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.GDPR_COOKIE_LIST],
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
    GDPRCookieSettings: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};


export const useGDPRCookieSettingsStoreMutation = () => {
  const router = useRouter();
  const { create } = useGDPRCookieSettingsStoreService();
  return useMutation({
    mutationFn: (values: GDPRCookieSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.GDPR_COOKIE_ADD],
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

