import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { GeneralQueryOptions, CurrencyQueryOptions, KeywordSuggestionQueryOptions } from "./com.type";


export const useGeneralListService = () => {
    return useBaseService<GeneralQueryOptions>(API_ENDPOINTS.GENERAL);
};

export const useCurrencyListService = () => {
    return useBaseService<CurrencyQueryOptions>(API_ENDPOINTS.CURRENCY);
};
export const useCurrencyDropdownListService = () => {
    return useBaseService<CurrencyQueryOptions>(API_ENDPOINTS.CURRENCY_DROPDOWN_LIST);
};
