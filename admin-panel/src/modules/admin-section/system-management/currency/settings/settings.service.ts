import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { GetwayModel, PaymentSettings } from "./settings.type";

// Hook for Payment Setting Service
export const useCurrencySettingsService = () => {
  return useBaseService<string>(API_ENDPOINTS.CURRENCY_SETTINGS);
};
export const useCurrencySettingsStoreService = () => {
  return useBaseService<string>(API_ENDPOINTS.CURRENCY_SETTINGS_UPDATE);
};
export const usePaymentSettingsUpdateService = () => {
  return useBaseService<PaymentSettings>(API_ENDPOINTS.PAYMENT_GETWAY_CURRENCY);
};
export const usePaymentGetwayService = (endpoiint: string) => {
  return useBaseService<GetwayModel>(endpoiint);
};
export const usePaymentGetwayUpdateService = (endpoiint: string) => {
  return useBaseService<GetwayModel>(endpoiint);
};
