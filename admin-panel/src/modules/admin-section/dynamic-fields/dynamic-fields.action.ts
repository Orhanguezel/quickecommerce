// src/modules/admin-section/dynamic-fields/dynamic-fields.action.ts
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from '@/endpoints/AdminApiEndPoints';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import type { DynamicFieldFormData, statusUpdateData } from './dynamic-fields.schema';
import {
  useDynamicFieldDeleteService,
  useDynamicFieldEditService,
  useDynamicFieldOptionDeleteService,
  useDynamicFieldOptionEditService,
  useDynamicFieldOptionQueryService,
  useDynamicFieldOptionStoreService,
  useDynamicFieldOptionUpdateService,
  useDynamicFieldQueryService,
  useDynamicFieldStatusUpdateService,
  useDynamicFieldStoreService,
  useDynamicFieldUpdateService,
  useDynamicRequiredFieldUpdateService,
} from './dynamic-fields.service';
import type { DynamicFieldQueryOptions } from './dynamic-fields.type';
import { useLocale } from 'next-intl';

function toastApiError(err: unknown) {
  const errorText = (err as any)?.response?.data;

  if (errorText && typeof errorText === 'object') {
    // Laravel style: { field: ["msg1","msg2"], message: "..." }
    Object.entries(errorText).forEach(([key, messages]) => {
      if (Array.isArray(messages)) messages.forEach((msg) => toast.error(String(msg)));
      else if (typeof messages === 'string') toast.error(messages);
      else if (key === 'message' && typeof (messages as any) === 'string')
        toast.error(String(messages));
    });

    if (typeof (errorText as any)?.message === 'string') toast.error((errorText as any).message);
    return;
  }

  if (typeof errorText?.message === 'string') toast.error(errorText.message);
  else toast.error('Request failed');
}

function normalizeListParams(options: Partial<DynamicFieldQueryOptions>) {
  const per_page = Number((options as any)?.limit ?? 10);
  const page = Number((options as any)?.page ?? 1);

  const params: Record<string, any> = {
    per_page: Number.isFinite(per_page) ? per_page : 10, // ✅ limit -> per_page
    page: Number.isFinite(page) ? page : 1,
    language: options.language ?? 'tr',
    sortField: options.sortField ?? 'id',
    sort: options.sort ?? 'desc',
  };

  if (typeof options.search === 'string' && options.search.trim().length > 0) {
    params.search = options.search.trim();
  }

  Object.keys(params).forEach((k) => {
    if (params[k] === undefined || params[k] === null) delete params[k];
  });

  return params;
}


// -----------------------------
// LIST (Dynamic Fields)
// -----------------------------
export const useDynamicFieldsQuery = (options: Partial<DynamicFieldQueryOptions>) => {
  const { findAll } = useDynamicFieldQueryService();

  const params = useMemo(
    () => normalizeListParams(options),
    [
      options.limit,
      options.page,
      options.language,
      options.sortField,
      options.sort,
      options.search,
    ],
  );

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DYNAMIC_FIELD_LIST, params],
    queryFn: () => findAll(params as any),
    refetchOnWindowFocus: false,
    retry: 0,
  });

  return {
    DynamicFields: (data as any)?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// -----------------------------
// GET BY ID
// -----------------------------
export const useDynamicFieldQueryById = (id: string) => {
  const locale = useLocale();
  const { findPageBySlug } = useDynamicFieldEditService();
  const errorToastRef = useRef<string | null>(null);

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DYNAMIC_FIELD_BY_ID, id, locale],
    queryFn: () => findPageBySlug(id, { language: locale }),
    refetchOnWindowFocus: false,
    enabled: !!id,
    retry: 0,
  });

  useEffect(() => {
    const msg = (error as any)?.response?.data?.message;
    if (error && msg && msg !== errorToastRef.current) {
      errorToastRef.current = String(msg);
      toast.error(String(msg), {
        onClose: () => (errorToastRef.current = null),
      });
    }
  }, [error]);

  return {
    DynamicFieldByID: (data as any)?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// -----------------------------
// CREATE
// -----------------------------
export const useDynamicFieldStoreMutation = () => {
  const router = useRouter();
  const { create } = useDynamicFieldStoreService();

  return useMutation({
    mutationKey: [API_ENDPOINTS.DYNAMIC_FIELD_CREATE],
    mutationFn: (values: DynamicFieldFormData) => create(values),
    onSuccess: async (res) => {
      const ok = Boolean((res as any)?.data);
      const msg = (res as any)?.data?.message;
      if (ok) {
        if (msg) toast.success(msg);
        router.push(Routes.DynamicField);
      } else {
        toast.error(msg || 'Create failed');
      }
    },
    onError: toastApiError,
  });
};

// -----------------------------
// UPDATE
// -----------------------------
export const useDynamicFieldUpdateMutation = () => {
  const router = useRouter();
  const { create } = useDynamicFieldUpdateService();

  return useMutation({
    mutationKey: [API_ENDPOINTS.DYNAMIC_FIELD_UPDATE],
    mutationFn: (values: DynamicFieldFormData) => create(values),
    onSuccess: async (res) => {
      const ok = Boolean((res as any)?.data);
      const msg = (res as any)?.data?.message;
      if (ok) {
        if (msg) toast.success(msg);
        router.push(Routes.DynamicField);
      } else {
        toast.error(msg || 'Update failed');
      }
    },
    onError: toastApiError,
  });
};

// -----------------------------
// STATUS UPDATE
// -----------------------------
export const useDynamicFieldStatusUpdate = () => {
  const { patchItem } = useDynamicFieldStatusUpdateService();

  return useMutation({
    mutationKey: [API_ENDPOINTS.DYNAMIC_FIELD_STATUS_UPDATE],
    mutationFn: (values: statusUpdateData) => patchItem(values),
    onSuccess: async (res) => {
      toast.success((res as any)?.data?.message ?? 'Updated');
    },
    onError: toastApiError,
  });
};

// -----------------------------
// REQUIRED UPDATE
// -----------------------------
export const useDynamicRequiredFieldUpdate = () => {
  const { patchItem } = useDynamicRequiredFieldUpdateService();

  return useMutation({
    mutationKey: [API_ENDPOINTS.DYNAMIC_REQUIRED_FIELD_UPDATE],
    mutationFn: (values: statusUpdateData) => patchItem(values),
    onSuccess: async (res) => {
      toast.success((res as any)?.data?.message ?? 'Updated');
    },
    onError: toastApiError,
  });
};

// -----------------------------
// DELETE
// -----------------------------
export const useDynamicFieldDelete = () => {
  const { delete: deleteItem } = useDynamicFieldDeleteService();

  return useMutation({
    mutationKey: [API_ENDPOINTS.DYNAMIC_FIELD_DELETE],
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: async (res) => {
      const msg = (res as any)?.data?.message;
      if ((res as any)?.data) toast.success(msg ?? 'Deleted');
      else toast.error(msg ?? 'Delete failed');
    },
    onError: toastApiError,
  });
};

// =====================================================================
// OPTION SECTION
// =====================================================================

function normalizeOptionListParams(options: Partial<DynamicFieldQueryOptions>) {
  const params: Record<string, any> = {
    dynamic_field_id: options.dynamic_field_id,
    language: options.language ?? 'tr',
    page: Number(options.page ?? 1),
    limit: Number((options as any)?.limit ?? 10),
    sortField: options.sortField ?? 'id',
    sort: options.sort ?? 'desc',
  };

  if (typeof options.search === 'string' && options.search.trim().length > 0) {
    params.search = options.search.trim();
  }

  Object.keys(params).forEach((k) => {
    if (params[k] === undefined || params[k] === null || params[k] === '') delete params[k];
  });

  return params;
}

export const useDynamicFieldOptionQuery = (options: Partial<DynamicFieldQueryOptions>) => {
  const { findAll } = useDynamicFieldOptionQueryService();

  const params = useMemo(
    () => normalizeOptionListParams(options),
    [
      options.dynamic_field_id,
      options.language,
      options.page,
      (options as any).limit,
      options.sortField,
      options.sort,
      options.search,
    ],
  );

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DYNAMIC_FIELD_OPTION_LIST, params],
    queryFn: () => findAll(params as any),
    refetchOnWindowFocus: false,
    enabled: !!options?.dynamic_field_id,
    retry: 0,
  });

  return {
    DynamicFieldOption: (data as any)?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useDynamicFieldOptionStoreMutation = () => {
  const { create } = useDynamicFieldOptionStoreService();

  return useMutation({
    mutationKey: [API_ENDPOINTS.DYNAMIC_FIELD_OPTION_CREATE],
    mutationFn: (values: DynamicFieldFormData) => create(values),
    onSuccess: async (res) => {
      const msg = (res as any)?.data?.message;
      if ((res as any)?.data) toast.success(msg ?? 'Created');
      else toast.error(msg ?? 'Create failed');
    },
    onError: toastApiError,
  });
};

export const useDynamicFieldOptionQueryById = (editRowId: string) => {
  const { find } = useDynamicFieldOptionEditService();
  const errorToastRef = useRef<string | null>(null);

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DYNAMIC_FIELD_OPTION_BY_ID, editRowId],
    queryFn: () => find(editRowId),
    refetchOnWindowFocus: false,
    enabled: !!editRowId,
    retry: 0,
  });

  useEffect(() => {
    const msg = (error as any)?.response?.data?.message;
    if (error && msg && msg !== errorToastRef.current) {
      errorToastRef.current = String(msg);
      toast.error(String(msg), {
        onClose: () => (errorToastRef.current = null),
      });
    }
  }, [error]);

  return {
    DynamicFieldOptionByID: (data as any)?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useDynamicFieldOptionUpdateMutation = () => {
  const { create } = useDynamicFieldOptionUpdateService();

  return useMutation({
    mutationKey: [API_ENDPOINTS.DYNAMIC_FIELD_OPTION_UPDATE],
    mutationFn: (values: DynamicFieldFormData) => create(values),
    onSuccess: async (res) => {
      const msg = (res as any)?.data?.message;
      if ((res as any)?.data) toast.success(msg ?? 'Updated');
      else toast.error(msg ?? 'Update failed');
    },
    onError: toastApiError,
  });
};

export const useDynamicFieldOptionDelete = () => {
  const { delete: deleteItem } = useDynamicFieldOptionDeleteService();

  return useMutation({
    mutationKey: [API_ENDPOINTS.DYNAMIC_FIELD_OPTION_DELETE],
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: async (res) => {
      const msg = (res as any)?.data?.message;
      if ((res as any)?.data) toast.success(msg ?? 'Deleted');
      else toast.error(msg ?? 'Delete failed');
    },
    onError: toastApiError,
  });
};
