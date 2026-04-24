"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { PublicCoupon } from "./coupon.type";

interface CouponListEnvelope {
  data: PublicCoupon[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

/**
 * Fetches all active public coupons.
 * Used by cart progress bar to show "Add X TL more to unlock coupon Y" UX.
 */
export function useActiveCouponsQuery() {
  const { findAll } = useBaseService<PublicCoupon>(API_ENDPOINTS.COUPONS);
  const locale = useLocale();

  return useQuery({
    queryKey: [API_ENDPOINTS.COUPONS, "active", locale],
    queryFn: async () => {
      const res = await findAll({ per_page: 50, language: locale });
      const payload = res.data as unknown as CouponListEnvelope | PublicCoupon[];
      return Array.isArray(payload) ? payload : payload.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
}
