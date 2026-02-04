import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FooterQueryOptions } from "./footer.type";
import { useFooterListService } from "./footer.service";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { Routes } from "@/config/routes";


// Hook for List
export const useFooterQuery = (options: Partial<FooterQueryOptions>) => {
    const { findAll } = useFooterListService();

    const { data, isPending, error, refetch, isFetching } = useQuery({
        queryKey: [API_ENDPOINTS.FOOTER],
        queryFn: () => findAll(options),
        ...options,
    });

    return {
        footer: data?.data ?? {},
        error,
        isPending,
        refetch,
        isFetching,
    };
};
