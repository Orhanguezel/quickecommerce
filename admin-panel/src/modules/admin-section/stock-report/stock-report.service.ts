import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { StockReport } from "./stock-report.type";

export const useStockReportQueryService = () => {
  return useBaseService<StockReport>(API_ENDPOINTS.STOCK_REPORT_LIST);
};