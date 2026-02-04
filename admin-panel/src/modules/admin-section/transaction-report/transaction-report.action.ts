import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useTransactionReportQueryService } from "./transaction-report.service";
import { TransactionReportQueryOptions } from "./transaction-report.type";


export const useTransactionReportQuery = (
  options: Partial<TransactionReportQueryOptions>
) => {
  const { findAll } = useTransactionReportQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.TRANSACTION_REPORT_LIST],
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
    TransactionReportData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
