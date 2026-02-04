import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { WalletSettings } from "./wallet-settings.type";

// Hook for wallet Service
export const useWalletSettingsService = () => {
  return useBaseService<WalletSettings>(API_ENDPOINTS.WALLET_SETTINGS);
};
