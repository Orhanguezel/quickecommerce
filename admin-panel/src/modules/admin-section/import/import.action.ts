import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useImportStoreService } from "./import.service";

export const useImportStoreMutation = () => {
  const { create } = useImportStoreService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.IMPORT],
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
