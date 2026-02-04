import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { PageSettingsFormDataRegister } from "./page-settings.schema";
import {
  useAdminSignInService,
  usePageSettingsAboutService,
  usePageSettingsBlogDetailsService,
  usePageSettingsContactService,
  usePageSettingsHomeService,
  usePageSettingsLoginService,
  usePageSettingsProductDetailsService,
  usePageSettingsRegisterService,
} from "./page-settings.service";
import { PageSettingsQueryOptions } from "./page-settings.type";
import { useEffect, useRef } from "react";

// Hook for register settings
export const usePageSettingsRegisterQuery = (
  options: Partial<PageSettingsQueryOptions>
) => {
  const { findAll } = usePageSettingsRegisterService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.REGISTER_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    RegisterSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePageSettingsRegisterStoreMutation = () => {
  const { create } = usePageSettingsRegisterService();

  return useMutation({
    mutationFn: (values: PageSettingsFormDataRegister) => create(values),
    mutationKey: [API_ENDPOINTS.REGISTER_SETTINGS],
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
// Hook for login settings
export const usePageSettingsLoginQuery = (
  options: Partial<PageSettingsQueryOptions>
) => {
  const { findAll } = usePageSettingsLoginService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.LOGIN_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    LoginSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePageSettingsLoginStoreMutation = () => {
  const { create } = usePageSettingsLoginService();

  return useMutation({
    mutationFn: (values: PageSettingsFormDataRegister) => create(values),
    mutationKey: [API_ENDPOINTS.LOGIN_SETTINGS],
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

export const useAdminSignInQuery = (
  options: Partial<PageSettingsQueryOptions>
) => {
  const { findAll } = useAdminSignInService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SIGN_IN_SETTINGS],
    queryFn: () => findAll(options),
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
    AdminSignInData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for about settings
export const usePageSettingsAboutQuery = (
  options: Partial<PageSettingsQueryOptions>
) => {
  const { findAll } = usePageSettingsAboutService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ABOUT_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    AboutSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePageSettingsAboutStoreMutation = () => {
  const { create } = usePageSettingsAboutService();

  return useMutation({
    mutationFn: (values: PageSettingsFormDataRegister) => create(values),
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
// Hook for contact settings
export const usePageSettingsContactQuery = (
  options: Partial<PageSettingsQueryOptions>
) => {
  const { findAll } = usePageSettingsContactService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CONTACT_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    ContactSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePageSettingsContactStoreMutation = () => {
  const { create } = usePageSettingsContactService();

  return useMutation({
    mutationFn: (values: PageSettingsFormDataRegister) => create(values),
    mutationKey: [API_ENDPOINTS.CONTACT_SETTINGS],
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

export const usePageSettingsProductDetailsQuery = (
  options: Partial<PageSettingsQueryOptions>
) => {
  const { findAll } = usePageSettingsProductDetailsService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PRODUCT_DETAILS_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    ProductDetailsSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePageSettingsProductDetailsStoreMutation = () => {
  const { create } = usePageSettingsProductDetailsService();

  return useMutation({
    mutationFn: (values: PageSettingsFormDataRegister) => create(values),
    mutationKey: [API_ENDPOINTS.PRODUCT_DETAILS_SETTINGS],
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
export const usePageSettingsBlogDetailsQuery = (
  options: Partial<PageSettingsQueryOptions>
) => {
  const { findAll } = usePageSettingsBlogDetailsService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BLOG_DETAILS_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    BlogDetailsSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePageSettingsBlogDetailsStoreMutation = () => {
  const { create } = usePageSettingsBlogDetailsService();

  return useMutation({
    mutationFn: (values: PageSettingsFormDataRegister) => create(values),
    mutationKey: [API_ENDPOINTS.BLOG_DETAILS_SETTINGS],
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

export const usePageSettingsHomeQuery = (
  options: Partial<PageSettingsQueryOptions>
) => {
  const { findAll } = usePageSettingsHomeService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.HOME_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    HomeSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePageSettingsHomeStoreMutation = () => {
  const { create } = usePageSettingsHomeService();
  return useMutation({
    mutationFn: (values: PageSettingsFormDataRegister) => create(values),
    mutationKey: [API_ENDPOINTS.HOME_SETTINGS],
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
