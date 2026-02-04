
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useStockReportQueryService } from "./stock-report.service";
import { StockReportQueryOptions } from "./stock-report.type";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";


export const useStockReportQuery = (options: Partial<StockReportQueryOptions>) => {
  const { findAll } = useStockReportQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.STOCK_REPORT_LIST],
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
    StockReportList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};