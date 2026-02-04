import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ExportFormData
} from "./export.schema";
import {
  useExportStoreService
} from "./export.service";


// Hook for creating a new brand
export const useExportStoreMutation = () => {
  const router = useRouter();
  const { create } = useExportStoreService();
  return useMutation({
    mutationFn: (values: ExportFormData) => create(values),
    mutationKey: [API_ENDPOINTS.EXPORT],
    onSuccess: async (data) => {
      if (Boolean(data)) {
        toast.success(data?.data?.message);
      } 
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
