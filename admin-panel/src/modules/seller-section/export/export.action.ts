import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ExportFormData
} from "./export.schema";
import {
  useExportStoreService
} from "./export.service";

export const useExportStoreMutation = () => {
  const router = useRouter();
  const { create } = useExportStoreService();
  return useMutation({
    mutationFn: (values: ExportFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.EXPORT],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
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
