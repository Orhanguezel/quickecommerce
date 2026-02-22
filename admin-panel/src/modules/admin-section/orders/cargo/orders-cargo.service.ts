import { useBaseService } from "@/modules/core/base.service";

export const useOrdersCargoService = (orderId: string | number) => {
  const base = useBaseService(`v1/admin/orders/${orderId}/cargo`);

  return {
    getCargo: base.findAll,
    getOffers: () =>
      base.getAxiosInstance().get(`v1/admin/orders/${orderId}/cargo/offers`),
    createCargo: (payload?: { offer_id?: string }) =>
      base.getAxiosInstance().post(`v1/admin/orders/${orderId}/cargo`, payload ?? {}),
    cancelCargo: () =>
      base.getAxiosInstance().delete(`v1/admin/orders/${orderId}/cargo`),
  };
};
