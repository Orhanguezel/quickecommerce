import { useBaseService } from "@/lib/base-service";
import type { BannerResponse } from "./banner.type";

export const useBannerService = () => {
  return useBaseService<BannerResponse>("/banner-list");
};
