
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useUnitService } from "./unit.service";
import { UnitQueryOptions } from "./unit.type";


export const useUnitQuery = (options: Partial<UnitQueryOptions>) => {
  const { findAll } = useUnitService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.UNIT_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    units: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
