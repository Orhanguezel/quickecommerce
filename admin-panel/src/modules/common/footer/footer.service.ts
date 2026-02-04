import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { FooterQueryOptions } from "./footer.type";


export const useFooterListService = () => {
    return useBaseService<FooterQueryOptions>(API_ENDPOINTS.FOOTER);
};