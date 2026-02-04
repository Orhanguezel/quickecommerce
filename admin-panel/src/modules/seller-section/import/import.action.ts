import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useImportStoreService } from "./import.service";

export const useImportStoreMutation = () => {
  const { create } = useImportStoreService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.IMPORT],
    onSuccess: async (data) => {
      if (Boolean(data)) {
        toast.success(data?.data?.message);
      }
    },
     onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data;
      if (errorText && typeof errorText === "object") {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};
