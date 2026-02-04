import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  statusUpdateData,
  SupportTicketFormData,
} from "./support-ticket.schema";
import {
  useReplyMessageService,
  useSupportTicketAddService,
  useSupportTicketDeleteService,
  useSupportTicketDetailsService,
  useSupportTicketEditService,
  useSupportTicketPriorityChangeService,
  useSupportTicketResolveService,
  useSupportTicketService,
  useSupportTicketUpdateService,
} from "./support-ticket.service";
import { SupportTicketQueryOptions } from "./support-ticket.type";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";

export const useSupportTicketsQuery = (
  options: Partial<SupportTicketQueryOptions>
) => {
  const { findAll } = useSupportTicketService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SUPPORT_TICKET_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  return {
    SupportTickets: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSupportTicketQueryById = (id: string) => {
  const { find } = useSupportTicketEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SUPPORT_TICKET_EDIT, id],
    queryFn: () => find(id),
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
    SupportTicket: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useSupportTicketDetailsById = (id: string) => {
  const { find } = useSupportTicketDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SUPPORT_TICKET_DETAILS, id],
    queryFn: () => find(id),
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
    SupportTicketDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSupportTicketStoreMutation = () => {
  const { create } = useSupportTicketAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: SupportTicketFormData) => create(values),
    mutationKey: [API_ENDPOINTS.SUPPORT_TICKET_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.supportTicketList);
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

export const useSupportTicketUpdateMutation = () => {
  const { create } = useSupportTicketUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: SupportTicketFormData) => create(values),
    mutationKey: [API_ENDPOINTS.SUPPORT_TICKET_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.supportTicketList);
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

export const useSupportTicketResolve = () => {
  const { create } = useSupportTicketResolveService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.SUPPORT_TICKET_RESOLVE],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useSupportTicketDelete = () => {
  const { create } = useSupportTicketDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.SUPPORT_TICKET_REMOVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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



export const useSupportTicketPriorityChange = () => {
  const { create } = useSupportTicketPriorityChangeService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.SUPPORT_TICKET_PRIORITY_CHANGE],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useReplyMessageMutation = () => {
  const { create } = useReplyMessageService();
  
  return useMutation({
    mutationFn: (values: SupportTicketFormData) => create(values),
    mutationKey: [API_ENDPOINTS.SUPPORT_TICKET_REPLY_MESSAGE],
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
