import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { Routes } from '@/config/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { CategoryFormData, statusUpdateData } from './category.schema';
import {
  useCategoryDeleteService,
  useCategoryEditService,
  useCategoryService,
  useCategoryStatusUpdateService,
  useCategoryStoreService,
  useCategoryUpdateService,
} from './category.service';
import type { CategoryQueryOptions } from './category.type';
import { useEffect, useMemo, useRef } from 'react';

function toastApiError(err: unknown) {
  const errorText = (err as any)?.response?.data;

  if (errorText && typeof errorText === 'object') {
    Object.entries(errorText).forEach(([_, messages]) => {
      if (Array.isArray(messages)) messages.forEach((msg) => toast.error(String(msg)));
      else if (typeof messages === 'string') toast.error(messages);
    });

    if (typeof (errorText as any)?.message === 'string') toast.error((errorText as any).message);
    return;
  }

  if (typeof errorText?.message === 'string') toast.error(errorText.message);
  else toast.error('Request failed');
}

function normalizeCategoryListParams(options: Partial<CategoryQueryOptions>) {
  // list endpoint’inde sende per_page kullanılıyor olabilir.
  // Backend “limit” bekliyorsa burada limit’e çevir.
  const per_page = Number((options as any)?.per_page ?? (options as any)?.limit ?? 10);
  const page = Number((options as any)?.page ?? 1);

  const params: Record<string, any> = {
    list: options.list,
    pagination: options.pagination,
    type: options.type ?? '',
    language: options.language ?? 'tr',
    page: Number.isFinite(page) ? page : 1,
    per_page: Number.isFinite(per_page) ? per_page : 10,
    sortField: (options as any)?.sortField ?? 'id',
    sort: (options as any)?.sort ?? 'desc',
    search: (options as any)?.search ?? '',
  };

  Object.keys(params).forEach((k) => {
    if (params[k] === undefined || params[k] === null || params[k] === '') delete params[k];
  });

  return params;
}

// --------------------------------------
// LIST
// --------------------------------------
export const useCategoriesQuery = (options: Partial<CategoryQueryOptions>) => {
  const { findAll } = useCategoryService();

  const params = useMemo(
    () => normalizeCategoryListParams(options),
    [
      options.list,
      options.pagination,
      options.type,
      (options as any)?.language,
      (options as any)?.page,
      (options as any)?.per_page,
      (options as any)?.limit,
      (options as any)?.sortField,
      (options as any)?.sort,
      (options as any)?.search,
    ],
  );

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CATEGORY, params], // ✅ parametreye göre cache
    queryFn: () => findAll(params as any), // ✅ sadece query params gider
    refetchOnWindowFocus: false,
    refetchOnMount: 'always', // ✅ sayfaya dönünce cache’e takılmasın
    retry: 0,
  });

  return {
    categories: (data as any)?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// --------------------------------------
// GET BY ID
// --------------------------------------
export const useCategoryQueryById = (id: string) => {
  const { find } = useCategoryEditService();
  const errorToastRef = useRef<string | null>(null);

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CATEGORY_EDIT, id],
    queryFn: () => find(id),
    retry: 0,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  useEffect(() => {
    const msg = (error as any)?.response?.data?.message;
    if (error && msg && msg !== errorToastRef.current) {
      errorToastRef.current = String(msg);
      toast.error(String(msg), { onClose: () => (errorToastRef.current = null) });
    }
  }, [error]);

  return {
    SingleCategory: (data as any)?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// --------------------------------------
// CREATE
// --------------------------------------
export const useCategoryStoreMutation = () => {
  const { create } = useCategoryStoreService();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [API_ENDPOINTS.CATEGORY_ADD],
    mutationFn: (values: CategoryFormData) => create(values),
    onSuccess: async (res) => {
      const ok = Boolean((res as any)?.data);
      const msg = (res as any)?.data?.message;

      if (ok) {
        toast.success(msg ?? 'Created');
        // ✅ liste cache’ini temizle
        await queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORY] });
        router.push(Routes.categories);
      } else {
        toast.error(msg ?? 'Create failed');
      }
    },
    onError: toastApiError,
  });
};

// --------------------------------------
// UPDATE
// --------------------------------------
export const useCategoryUpdateMutation = () => {
  const { create } = useCategoryUpdateService();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [API_ENDPOINTS.CATEGORY_UPDATE],
    mutationFn: (values: CategoryFormData) => create(values),
    onSuccess: async (res) => {
      const ok = Boolean((res as any)?.data);
      const msg = (res as any)?.data?.message;

      if (ok) {
        toast.success(msg ?? 'Updated');
        await queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORY] });
        router.push(Routes.categories);
      } else {
        toast.error(msg ?? 'Update failed');
      }
    },
    onError: toastApiError,
  });
};

// --------------------------------------
// STATUS
// --------------------------------------
export const useCategoryStatusUpdate = () => {
  const { patchItem } = useCategoryStatusUpdateService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [API_ENDPOINTS.CATEGORY_STATUS],
    mutationFn: (values: statusUpdateData) => patchItem(values),
    onSuccess: async (res) => {
      toast.success((res as any)?.data?.message ?? 'Updated');
      await queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORY] });
    },
    onError: toastApiError,
  });
};

// --------------------------------------
// DELETE
// --------------------------------------
export const useCategoryDelete = () => {
  const { create } = useCategoryDeleteService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [API_ENDPOINTS.CATEGORY_REMOVE],
    mutationFn: (values: any) => create(values),
    onSuccess: async (res) => {
      const ok = Boolean((res as any)?.data);
      const msg = (res as any)?.data?.message;

      if (ok) {
        toast.success(msg ?? 'Deleted');
        await queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORY] });
      } else {
        toast.error(msg ?? 'Delete failed');
      }
    },
    onError: toastApiError,
  });
};
