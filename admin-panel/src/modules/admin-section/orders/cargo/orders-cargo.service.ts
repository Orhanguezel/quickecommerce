import { useBaseService } from "@/modules/core/base.service";

export const useOrdersCargoService = (orderId: string | number) => {
  const base = useBaseService(`v1/admin/orders/${orderId}/cargo`);

  return {
    getCargo: base.findAll,
    createCargo: base.postEmpty,
    cancelCargo: () =>
      base.getAxiosInstance().delete(`v1/admin/orders/${orderId}/cargo`),
  };
};
