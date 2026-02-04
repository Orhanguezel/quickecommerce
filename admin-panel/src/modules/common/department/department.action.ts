
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { DepartmentQueryOptions } from "./department.type";
import { useDepartmentService } from "./department.service";

// Hook for querying area dropdown data
export const useDepartmentQuery = (options: Partial<DepartmentQueryOptions>) => {
  const { findAll } = useDepartmentService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DEPARTMENT_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    DepartmentList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
