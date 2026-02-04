import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { SubscribeFormData } from "./Newsletter.schema";
import { useSubscribeService, useUnSubscribeService } from "./Newsletter.service";
import { CustomError } from "./Newsletter.type";


export const useSubscribeMutation = () => {
    const { create } = useSubscribeService();
    return useMutation({
        mutationFn: (values: SubscribeFormData) => create(values),
        mutationKey: [API_ENDPOINTS.SUBSCRIBE],
        onSuccess: async (data) => {
            if (Boolean(data?.data)) {
                toast.success("Subscription successful!");
            } else {
                toast.error("error");
            }
        },
        onError: async (data: any) => {
            toast.error(data?.response?.data?.email[0]);
        },
    });
};


export const useUnSubscribeMutation = () => {
    const { create } = useUnSubscribeService();
    return useMutation({
        mutationFn: (values: SubscribeFormData) => create(values),
        mutationKey: [API_ENDPOINTS.UNSUBSCRIBE],
        onSuccess: async (data) => {
            if (Boolean(data?.data)) {
                toast.success("Unsubscription successful!");
            } else {
                toast.error("error");
            }
        },
        onError: async (data: CustomError) => {
            
            toast.error(data?.response?.data?.message);
        },
    });
};