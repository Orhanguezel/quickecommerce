
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FlashDealsFormData, statusUpdateData } from "./flash-deals.schema";
import {
  useActiveFlashDealsService,
  useFlashDealsDetailsService,
  useFlashDealsEditService,
  useFlashDealsPriorityChangeService,
  useFlashDealsResolveService,
  useFlashDealsService,
  useFlashDealsUpdateService,
  useJoinFlashDealsStoreService,
  useMyFlashDealsService,
  useReplyMessageService
} from "./flash-deals.service";
import { FlashDealsQueryOptions } from "./flash-deals.type";

export const useActiveFlashDealsQuery = (options: Partial<FlashDealsQueryOptions>) => {
  const { findAll } = useActiveFlashDealsService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.FLASH_DEALS_ACTIVE_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
  });
  return {
    ActiveFlashDeals: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useMyFlashDealsQuery = (options: Partial<FlashDealsQueryOptions>) => {
  const { findAll } = useMyFlashDealsService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.FLASH_DEALS_MY_LIST, options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id
  });
  return {
    MyFlashDeals: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useJoinFlashDealsStoreMutation = () => {
  const { create } = useJoinFlashDealsStoreService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: FlashDealsFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.FLASH_DEALS_JOIN_STORE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.MyDealsList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};


export const useFlashDealsQuery = (options: Partial<FlashDealsQueryOptions>) => {
  const { findAll } = useFlashDealsService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_LIST, options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id
  });
  return {
    FlashDeals: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useFlashDealsQueryById = (id: string) => {
  const { find } = useFlashDealsEditService();
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
    FlashDeals: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};



export const useFlashDealsUpdateMutation = () => {
  const { create } = useFlashDealsUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: FlashDealsFormData) => create(values),
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

export const useFlashDealsResolve = () => {
  const { create } = useFlashDealsResolveService();
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
export const useFlashDealsPriorityChange = () => {
  const { create } = useFlashDealsPriorityChangeService();
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



export const useFlashDealsDetailsById = (id: string, store_id?: string) => {
  const { findByStore } = useFlashDealsDetailsService();
  const errorToastRef = useRef<string | null>(null);

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_DETAILS, id, store_id],
    queryFn: () => findByStore(id, store_id), 
    refetchOnWindowFocus: false,
    enabled: !!id && !!store_id, 
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
    FlashDealsDetails: data?.data ?? {},
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
    mutationFn: (values: FlashDealsFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SUPPORT_TICKET_REPLY_MESSAGE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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