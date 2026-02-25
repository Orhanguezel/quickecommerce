import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useOrdersCargoService } from "./orders-cargo.service";

export const useOrderCargoQuery = (orderId: string | number) => {
  const { getCargo } = useOrdersCargoService(orderId);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["orders-cargo", orderId],
    queryFn: async () => {
      try {
        return await getCargo();
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null; // Henüz kargo yok
        }
        throw err;
      }
    },
    enabled: !!orderId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    cargoData: (data?.data as any)?.data ?? null,
    isPending,
    error,
    refetch,
  };
};

export const useCreateCargoMutation = (orderId: string | number) => {
  const { createCargo } = useOrdersCargoService(orderId);

  return useMutation({
    mutationFn: (payload?: { offer_id?: string }) => createCargo(payload),
    mutationKey: ["orders-cargo-create", orderId],
    onSuccess: (data: any) => {
      toast.success(data?.data?.message || "Kargo başarıyla oluşturuldu.");
    },
    onError: (data: any) => {
      toast.error(
        data?.response?.data?.message || "Kargo oluşturulamadı."
      );
    },
  });
};

export const useOrderCargoOffersQuery = (
  orderId: string | number,
  enabled: boolean = true
) => {
  const { getOffers } = useOrdersCargoService(orderId);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["orders-cargo-offers", orderId],
    queryFn: () => getOffers(),
    enabled: Boolean(orderId) && enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    offersData: (data?.data as any)?.data ?? null,
    isPending: isFetching,
    error,
    refetch,
  };
};

export const useCancelCargoMutation = (orderId: string | number) => {
  const { cancelCargo } = useOrdersCargoService(orderId);

  return useMutation({
    mutationFn: () => cancelCargo(),
    mutationKey: ["orders-cargo-cancel", orderId],
    onSuccess: (data: any) => {
      toast.success(data?.data?.message || "Kargo iptal edildi.");
    },
    onError: (data: any) => {
      toast.error(
        data?.response?.data?.message || "İptal işlemi başarısız."
      );
    },
  });
};
