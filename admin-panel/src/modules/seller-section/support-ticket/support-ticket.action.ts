
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { statusUpdateData, SupportTicketFormData } from "./support-ticket.schema";
import {
  useReplyMessageService,
  useSupportTicketAddService,
  useSupportTicketDetailsService,
  useSupportTicketEditService,
  useSupportTicketPriorityChangeService,
  useSupportTicketResolveService,
  useSupportTicketService,
  useSupportTicketUpdateService
} from "./support-ticket.service";
import { SupportTicketQueryOptions } from "./support-ticket.type";

export const useSupportTicketsQuery = (options: Partial<SupportTicketQueryOptions>) => {
  const { findAll } = useSupportTicketService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_LIST, options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id
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
    queryKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_EDIT, id],
    queryFn: () => find(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
  useEffect(() => {
    const errorToast = (error as any)?.response?.data?.message;
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

export const useSupportTicketStoreMutation = () => {
  const { create } = useSupportTicketAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: SupportTicketFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.supportTicketList);
      } else {
        toast.error(data?.data?.message);
      }
    },
     onError: async (data) => {
      const errorText = (data as any)?.response?.data;
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

export const useSupportTicketUpdateMutation = () => {
  const { create } = useSupportTicketUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: SupportTicketFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.supportTicketList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
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

export const useSupportTicketResolve = () => {
  const { create } = useSupportTicketResolveService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_RESOLVE],
    onSuccess: async (data) => {
        toast.success(data?.data?.message);
      },
      onError: async (data) => {
      const errorText = (data as any)?.response?.data;
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
    mutationKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_PRIORITY_CHANGE],
    onSuccess: async (data) => {
     
        toast.success(data?.data?.message);
      },
       onError: async (data) => {
      const errorText = (data as any)?.response?.data;
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



export const useSupportTicketDetailsById = (id: string, store_id?: string) => {
  const { findByStore } = useSupportTicketDetailsService();
  const errorToastRef = useRef<string | null>(null);

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_DETAILS, id, store_id], // Include store_id in queryKey
    queryFn: () => findByStore(id, store_id), // Pass id and store_id to API function
    refetchOnWindowFocus: false,
    enabled: !!id && !!store_id, // Ensure both id and store_id are available before fetching
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



export const useReplyMessageMutation = () => {
  const { create } = useReplyMessageService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: SupportTicketFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_REPLY_MESSAGE],
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