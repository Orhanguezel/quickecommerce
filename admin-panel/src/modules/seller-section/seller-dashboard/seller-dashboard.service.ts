import { useBaseService } from '@/modules/core/base.service';
import { SellerDashboard } from './seller-dashboard.type';
import { SELLER_API_ENDPOINTS } from '@/endpoints/SellerApiEndPoints';

import { env } from '@/env.mjs';
import { AUTH_TOKEN_KEY } from '@/lib/constants';
import axios, { AxiosRequestHeaders } from 'axios';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';

export const useSellerDashboardService = () => {
  return useBaseService<SellerDashboard>(SELLER_API_ENDPOINTS.SELLER_DASHBOARD_LIST);
};
export const useSellerSalesService = () => {
  return useBaseService<SellerDashboard>(SELLER_API_ENDPOINTS.SELLER_SALES_LIST);
};
export const useSellerOrderGrowthService = () => {
  return useBaseService<SellerDashboard>(SELLER_API_ENDPOINTS.SELLER_ORDER_GROWTH_LIST);
};
export const useSellerOtherSummaryService = () => {
  return useBaseService<SellerDashboard>(SELLER_API_ENDPOINTS.SELLER_OTHER_SUMMARY_LIST);
};
