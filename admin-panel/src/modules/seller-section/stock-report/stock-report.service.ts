import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { StockReport } from "./stock-report.type";

export const useStockReportQueryService = () => {
  return useBaseService<StockReport>(SELLER_API_ENDPOINTS.STOCK_REPORT_LIST);
};