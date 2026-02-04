
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { useDatabaseUpdateControlsService } from "./database-update-controls.service";



// Hook for creating a new brand
export const useDatabaseUpdateControlsStoreMutation = () => {
  const router = useRouter();
  const { postEmpty } = useDatabaseUpdateControlsService();

  return useMutation({
    mutationFn: () => postEmpty(),
    mutationKey: [API_ENDPOINTS.DATABASE_UPDATE_CONTROL],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      toast.error(data?.message);
    },
  });
};
