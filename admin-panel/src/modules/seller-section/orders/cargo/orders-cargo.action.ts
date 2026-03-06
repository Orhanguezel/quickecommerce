import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSellerOrdersCargoService } from "./orders-cargo.service";

export const useSellerOrderCargoQuery = (orderId: string | number) => {
  const { getCargo } = useSellerOrdersCargoService(orderId);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["seller-orders-cargo", orderId],
    queryFn: async () => {
      try {
        return await getCargo();
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null;
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

export const useSellerCreateCargoMutation = (orderId: string | number) => {
  const { createCargo } = useSellerOrdersCargoService(orderId);

  return useMutation({
    mutationFn: (payload?: { offer_id?: string }) => createCargo(payload),
    mutationKey: ["seller-orders-cargo-create", orderId],
    onSuccess: (data: any) => {
      toast.success(data?.data?.message || "Kargo basariyla olusturuldu.");
    },
    onError: (data: any) => {
      toast.error(
        data?.response?.data?.message || "Kargo olusturulamadi."
      );
    },
  });
};

export const useSellerOrderCargoOffersQuery = (
  orderId: string | number,
  enabled: boolean = true
) => {
  const { getOffers } = useSellerOrdersCargoService(orderId);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["seller-orders-cargo-offers", orderId],
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

export const useSellerCancelCargoMutation = (orderId: string | number) => {
  const { cancelCargo } = useSellerOrdersCargoService(orderId);

  return useMutation({
    mutationFn: () => cancelCargo(),
    mutationKey: ["seller-orders-cargo-cancel", orderId],
    onSuccess: (data: any) => {
      toast.success(data?.data?.message || "Kargo iptal edildi.");
    },
    onError: (data: any) => {
      toast.error(
        data?.response?.data?.message || "Iptal islemi basarisiz."
      );
    },
  });
};
