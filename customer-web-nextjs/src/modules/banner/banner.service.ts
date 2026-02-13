import { useBaseService } from "@/lib/base-service";
import type { BannerGroupedResponse } from "./banner.type";

export const useBannerService = () => {
  return useBaseService<BannerGroupedResponse>("/banner-list");
};
