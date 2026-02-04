import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { StaffFormData, statusUpdateData } from "./staff.schema";
import {
  useSellerRolesQueryService,
  useStaffDeleteService,
  useStaffEditService,
  useStaffQueryService,
  useStaffStatusUpdateService,
  useStaffStoreService,
  useStaffUpdateService,
} from "./staff.service";
import { StaffQueryOptions } from "./staff.type";

export const useSellerRolesQuery = (options: Partial<StaffQueryOptions>) => {
  const { findAll } = useSellerRolesQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_ROLES],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    sellerRoles: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useStaffQuery = (options: Partial<StaffQueryOptions>) => {
  const { findAll } = useStaffQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.STAFF_LIST],
    queryFn: () => findAll(options),
    enabled: !!options,
    ...options,
  });
  return {
    staff: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStaffQueryById = (id: string) => {
  const { find } = useStaffEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.STAFF_EDIT, id],
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
    StaffByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStaffStoreMutation = () => {
  const router = useRouter();
  const { create } = useStaffStoreService();
  return useMutation({
    mutationFn: (values: StaffFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.STAFF_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.staff);
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
export const useStaffUpdateMutation = () => {
  const router = useRouter();
  const { create } = useStaffUpdateService();
  return useMutation({
    mutationFn: (values: StaffFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.STAFF_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.staff);
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

export const useStaffStatusUpdate = () => {
  const { create } = useStaffStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.STAFF_STATUS],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
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

// export const useStaffDelete = () => {
//   const { delete: deleteItem } = useStaffDeleteService();
//   return useMutation({
//     mutationFn: (id: string) => deleteItem(id),
//     mutationKey: [SELLER_API_ENDPOINTS.STAFF_REMOVE],
//     onSuccess: async (data) => {
//       toast.success((data as any)?.data?.message);
//     },
//     onError: async (data) => {
//       const errorText = (data as any)?.response?.data;
//       if (errorText && typeof errorText === "object") {
//         Object.entries(errorText).forEach(([key, messages]) => {
//           if (Array.isArray(messages)) {
//             messages.forEach((msg) => toast.error(msg));
//           } else if (typeof messages === "string") {
//             toast.error(messages);
//           }
//         });
//       } else {
//         toast.error(errorText?.message);
//       }
//     },
//   });
// };

export const useStaffDelete = () => {
  const { create } = useStaffDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.STAFF_REMOVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
      } else {
        toast.error((data as any)?.data?.message);
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
