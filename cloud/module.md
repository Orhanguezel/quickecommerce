Admin panel için yeni modül oluştur: $ARGUMENTS

## Next.js Admin Panel Modül Yapısı

### 1. Modül Klasörü Oluştur

```
src/modules/admin-section/[module-name]/
├── [module-name].action.ts     # API calls
├── [module-name].schema.ts     # Zod validation
├── [module-name].service.ts    # Service layer (optional)
└── [module-name].type.ts       # TypeScript types
```

### 2. Types Dosyası

```typescript
// src/modules/admin-section/[name]/[name].type.ts

export interface ModuleName {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModuleNameInput {
  name: string;
  description?: string;
  status?: boolean;
}

export interface UpdateModuleNameInput extends CreateModuleNameInput {
  id: number;
}

export interface ModuleNameListResponse {
  status: boolean;
  data: {
    data: ModuleName[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

### 3. Zod Schema

```typescript
// src/modules/admin-section/[name]/[name].schema.ts
import { z } from "zod";

export const moduleNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  status: z.boolean().default(true),
});

export type ModuleNameFormData = z.infer<typeof moduleNameSchema>;
```

### 4. Actions (API Calls)

```typescript
// src/modules/admin-section/[name]/[name].action.ts
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import axiosInstance from "@/lib/axios";
import type {
  ModuleName,
  CreateModuleNameInput,
  UpdateModuleNameInput,
  ModuleNameListResponse
} from "./[name].type";

interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: boolean;
}

export const getModuleNameList = async (params?: QueryParams): Promise<ModuleNameListResponse> => {
  const response = await axiosInstance.get(API_ENDPOINTS.MODULE_NAME_LIST, { params });
  return response.data;
};

export const getModuleNameDetails = async (id: number): Promise<{ status: boolean; data: ModuleName }> => {
  const response = await axiosInstance.get(API_ENDPOINTS.MODULE_NAME_EDIT, { params: { id } });
  return response.data;
};

export const createModuleName = async (data: CreateModuleNameInput) => {
  const response = await axiosInstance.post(API_ENDPOINTS.MODULE_NAME_ADD, data);
  return response.data;
};

export const updateModuleName = async (data: UpdateModuleNameInput) => {
  const response = await axiosInstance.post(API_ENDPOINTS.MODULE_NAME_UPDATE, data);
  return response.data;
};

export const deleteModuleName = async (id: number) => {
  const response = await axiosInstance.post(API_ENDPOINTS.MODULE_NAME_DELETE, { id });
  return response.data;
};

export const changeModuleNameStatus = async (id: number) => {
  const response = await axiosInstance.post(API_ENDPOINTS.MODULE_NAME_STATUS_CHANGE, { id });
  return response.data;
};
```

### 5. Service Layer (Optional)

```typescript
// src/modules/admin-section/[name]/[name].service.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as actions from "./[name].action";
import type { QueryParams } from "./[name].type";

export const useModuleNameList = (params?: QueryParams) => {
  return useQuery({
    queryKey: ["module-name", "list", params],
    queryFn: () => actions.getModuleNameList(params),
  });
};

export const useModuleNameDetails = (id: number) => {
  return useQuery({
    queryKey: ["module-name", "details", id],
    queryFn: () => actions.getModuleNameDetails(id),
    enabled: !!id,
  });
};

export const useCreateModuleName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actions.createModuleName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-name", "list"] });
    },
  });
};

export const useUpdateModuleName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actions.updateModuleName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-name"] });
    },
  });
};

export const useDeleteModuleName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actions.deleteModuleName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-name", "list"] });
    },
  });
};
```

### 6. Endpoint Tanımları Ekle

```typescript
// src/endpoints/AdminApiEndPoints.ts

// MODULE_NAME endpoints
MODULE_NAME_LIST: "v1/admin/module-name/list",
MODULE_NAME_ADD: "v1/admin/module-name/add",
MODULE_NAME_EDIT: "v1/admin/module-name/details",
MODULE_NAME_UPDATE: "v1/admin/module-name/update",
MODULE_NAME_DELETE: "v1/admin/module-name/remove",
MODULE_NAME_STATUS_CHANGE: "v1/admin/module-name/change-status",
```

### 7. Route Tanımları Ekle

```typescript
// src/config/routes.ts

moduleNameList: "/admin/module-name/list",
addModuleName: "/admin/module-name/add",
editModuleName: "/admin/module-name/edit",
```

### 8. Page Component

```typescript
// src/app/[locale]/admin/module-name/list/page.tsx
"use client";

import { useModuleNameList } from "@/modules/admin-section/module-name/module-name.service";
import { DataTable } from "@/components/ui/data-table";

export default function ModuleNameListPage() {
  const { data, isLoading } = useModuleNameList();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Module Name List</h1>
      <DataTable data={data?.data?.data || []} columns={columns} />
    </div>
  );
}
```

## Kontrol Listesi

- [ ] Modül klasörü oluşturuldu
- [ ] Types tanımlandı
- [ ] Zod schema yazıldı
- [ ] Actions (API calls) yazıldı
- [ ] Service hooks yazıldı (optional)
- [ ] Endpoint tanımları eklendi (AdminApiEndPoints.ts)
- [ ] Route tanımları eklendi (routes.ts)
- [ ] Page components oluşturuldu
- [ ] Build hatasız çalışıyor
