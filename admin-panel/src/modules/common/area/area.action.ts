
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { AreaDropdownQueryOptions } from "./area.type";
import { useAreaDropdownService } from "./area.service";

// Hook for querying area dropdown data
export const useAreaDropdownQuery = (options: Partial<AreaDropdownQueryOptions>) => {
  const { findAll } = useAreaDropdownService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AREA_DROPDOWN_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    AreaDropdownList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
