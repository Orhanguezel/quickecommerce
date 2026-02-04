
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ContactUsFormData } from "./contact-us.schema";
import {
  useContactUsAddService
} from "./contact-us.service";



export const useContactUsStoreMutation = () => {
  const { create } = useContactUsAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: ContactUsFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.CONTACT_US],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
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
