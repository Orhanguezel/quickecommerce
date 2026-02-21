import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FlashDealsFormData, statusUpdateData } from "./flash-deals.schema";
import {
  useDeactivateExpiredFlashDealService,
  useFlashDealsAllProductsQueryService,
  useFlashDealsDeleteService,
  useFlashDealsDropdownQueryService,
  useFlashDealsEditService,
  useFlashDealsQueryService,
  useFlashDealsStatusUpdateService,
  useFlashDealsStoreService,
  useFlashDealsUpdateService,
  useJoinRequestApproveService,
  useJoinRequestQueryService,
  useJoinRequestRejectService,
  useTypeWiseStoreService,
} from "./flash-deals.service";
import { FlashDealsQueryOptions } from "./flash-deals.type";
import { useEffect, useRef } from "react";


export const useFlashDealsQuery = (
  options: Partial<FlashDealsQueryOptions>
) => {
  const { findAll } = useFlashDealsQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.FLASH_DEALS_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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
export const useFlashDealsDropdownQuery = (
  options: Partial<FlashDealsQueryOptions>
) => {
  const { findAll } = useFlashDealsDropdownQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.FLASH_DEALS_DROPDOWN_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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
    FlashDealsDropdown: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useFlashDealsAllProductsQuery = (
  options: Partial<FlashDealsQueryOptions>
) => {
  const { findAll } = useFlashDealsAllProductsQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.FLASH_DEALS_ALL_PRODUCTS_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  return {
    FlashDealsAllProducts: data?.data ?? {},
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
    queryKey: [API_ENDPOINTS.FLASH_DEALS_EDIT, id],
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
    FlashDeal: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useFlashDealsStoreMutation = () => {
  const router = useRouter();
  const { create } = useFlashDealsStoreService();
  return useMutation({
    mutationFn: (values: FlashDealsFormData) => create(values as any),
    mutationKey: [API_ENDPOINTS.FLASH_DEALS_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        
        toast.success(data?.data?.message);
        router.push(Routes.flashDealsList);
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
export const useFlashDealsUpdateMutation = () => {
  const router = useRouter();
  const { update } = useFlashDealsUpdateService();
  return useMutation({
    mutationFn: (values: FlashDealsFormData) => update(values),
    mutationKey: [API_ENDPOINTS.FLASH_DEALS_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.flashDealsList);
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

export const useFlashDealsStatusUpdate = () => {
  const { patchItem } = useFlashDealsStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.FLASH_DEALS_STATUS_UPDATE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useFlashDealsDelete = () => {
  const { delete: deleteItem } = useFlashDealsDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.FLASH_DEALS_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useDeactivateExpiredFlashDealMutation = () => {
  const { postEmpty } = useDeactivateExpiredFlashDealService();

  return useMutation({
    mutationFn: () => postEmpty(),
    mutationKey: [API_ENDPOINTS.DEACTIVATE_EXPIRED_FLASH_SALE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        
        toast.success(data?.data?.message);
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

export const useJoinRequestQuery = (
  options: Partial<FlashDealsQueryOptions>
) => {
  const { findAll } = useJoinRequestQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.JOIN_REQUEST_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    JoinRequestData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useJoinRequestApproveMutation = () => {
  const { patchItem } = useJoinRequestApproveService();
  return useMutation({
    mutationFn: (values: any) => patchItem(values),
    mutationKey: [API_ENDPOINTS.JOIN_REQUEST_APPROVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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
export const useJoinRequestRejectMutation = () => {
  const { patchItem } = useJoinRequestRejectService();
  return useMutation({
    mutationFn: (values: any) => patchItem(values),
    mutationKey: [API_ENDPOINTS.JOIN_REQUEST_REJECT],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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



export const useTypeWiseStoreQuery = (options: Partial<FlashDealsQueryOptions>) => {
  const { findAll } = useTypeWiseStoreService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.TYPE_WISE_STORE_LIST, options?.store_type],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    TypeWiseStoreList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};