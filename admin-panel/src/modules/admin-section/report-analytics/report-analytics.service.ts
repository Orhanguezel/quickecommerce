import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./report-analytics.schema";
import { ReportAnalytics } from "./report-analytics.type";

// Hook for ReportAnalytics Service
export const useReportAnalyticsQueryService = () => {
  return useBaseService<ReportAnalytics>(API_ENDPOINTS.REPORT_ANALYTICS_LIST);
};

