import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { EmailTemplateFormData, statusUpdateData } from "./email-template.schema";
import {
  useEmailTemplateAddService,
  useEmailTemplateDeleteService,
  useEmailTemplateEditService,
  useEmailTemplateQueryService,
  useEmailTemplateStatusUpdateService,
  useEmailTemplateUpdateService,
} from "./email-template.service";
import { EmailTemplateQueryOptions } from "./email-template.type";
import { useRouter } from "next/navigation";
import { Routes } from "@/config/routes";


export const useEmailTemplateQuery = (options: Partial<EmailTemplateQueryOptions>) => {
  const { findAll } = useEmailTemplateQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.EMAIL_TEMPLATE_LIST],
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
    EmailTemplates: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useEmailTemplateQueryById = (id: string) => {
  const { find } = useEmailTemplateEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.EMAIL_TEMPLATE_EDIT, id],
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
    EmailTemplate: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useEmailTemplateStoreMutation = () => {
  const { create } = useEmailTemplateAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: EmailTemplateFormData) => create(values),
    mutationKey: [API_ENDPOINTS.EMAIL_TEMPLATE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.EmailTemplateList);
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
export const useEmailTemplateUpdateMutation = () => {
  const { create } = useEmailTemplateUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: EmailTemplateFormData) => create(values),
    mutationKey: [API_ENDPOINTS.EMAIL_TEMPLATE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.EmailTemplateList);
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

// Hook for updating brand status
export const useEmailTemplateStatusUpdate = () => {
  const { create } = useEmailTemplateStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.EMAIL_TEMPLATE_STATUS_CHANGE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useEmailTemplateDelete = () => {
  const { delete: deleteItem } = useEmailTemplateDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.EMAIL_TEMPLATE_DELETE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
