import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Subscribe } from "./Newsletter.type";


export const useSubscribeService = () => {
    return useBaseService<Subscribe>(API_ENDPOINTS.SUBSCRIBE);
};

export const useUnSubscribeService = () => {
    return useBaseService<Subscribe>(API_ENDPOINTS.UNSUBSCRIBE);
};