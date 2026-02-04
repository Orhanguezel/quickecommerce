import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { TransactionReport } from "./transaction-report.type";

// Hook for TransactionReport Service
export const useTransactionReportQueryService = () => {
  return useBaseService<TransactionReport>(API_ENDPOINTS.TRANSACTION_REPORT_LIST);
};

