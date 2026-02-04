import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useReportAnalyticsQueryService } from "./report-analytics.service";
import { ReportAnalyticsQueryOptions } from "./report-analytics.type";


export const useReportAnalyticsQuery = (
  options: Partial<ReportAnalyticsQueryOptions>
) => {
  const { findAll } = useReportAnalyticsQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.REPORT_ANALYTICS_LIST],
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
    ReportAnalyticsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
