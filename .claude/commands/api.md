Yeni bir Laravel API endpoint oluştur: $ARGUMENTS

## Laravel API Endpoint Pattern

### 1. Controller Oluştur

```php
// app/Http/Controllers/Api/Admin/[Name]Controller.php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NameController extends Controller
{
    /**
     * List all items
     */
    public function list(Request $request): JsonResponse
    {
        $query = Model::query();

        // Search
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $data = $query->paginate($perPage);

        return response()->json([
            'status' => true,
            'message' => 'Data fetched successfully',
            'data' => $data,
        ]);
    }

    /**
     * Store new item
     */
    public function store(StoreRequest $request): JsonResponse
    {
        $data = Model::create($request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Created successfully',
            'data' => $data,
        ], 201);
    }

    /**
     * Get single item details
     */
    public function details(Request $request): JsonResponse
    {
        $item = Model::findOrFail($request->id);

        return response()->json([
            'status' => true,
            'data' => $item,
        ]);
    }

    /**
     * Update item
     */
    public function update(UpdateRequest $request): JsonResponse
    {
        $item = Model::findOrFail($request->id);
        $item->update($request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Updated successfully',
            'data' => $item,
        ]);
    }

    /**
     * Delete item
     */
    public function remove(Request $request): JsonResponse
    {
        $item = Model::findOrFail($request->id);
        $item->delete();

        return response()->json([
            'status' => true,
            'message' => 'Deleted successfully',
        ]);
    }

    /**
     * Change status
     */
    public function changeStatus(Request $request): JsonResponse
    {
        $item = Model::findOrFail($request->id);
        $item->update(['status' => !$item->status]);

        return response()->json([
            'status' => true,
            'message' => 'Status changed successfully',
        ]);
    }
}
```

### 2. Form Request Validation

```php
// app/Http/Requests/Admin/StoreNameRequest.php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreNameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ];
    }
}
```

### 3. Route Tanımları

```php
// routes/admin-api.php

// Grup içinde ekle
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'admin'])->group(function () {

    // Resource routes
    Route::prefix('name')->group(function () {
        Route::get('/list', [NameController::class, 'list']);
        Route::post('/add', [NameController::class, 'store']);
        Route::get('/details', [NameController::class, 'details']);
        Route::post('/update', [NameController::class, 'update']);
        Route::post('/remove', [NameController::class, 'remove']);
        Route::post('/change-status', [NameController::class, 'changeStatus']);
    });

});
```

### 4. Admin Panel Endpoint Tanımı

```typescript
// admin-panel/src/endpoints/AdminApiEndPoints.ts

// NAME endpoints
NAME_LIST: "v1/admin/name/list",
NAME_ADD: "v1/admin/name/add",
NAME_EDIT: "v1/admin/name/details",
NAME_UPDATE: "v1/admin/name/update",
NAME_DELETE: "v1/admin/name/remove",
NAME_STATUS_CHANGE: "v1/admin/name/change-status",
```

### 5. Admin Panel Action

```typescript
// admin-panel/src/modules/admin-section/name/name.action.ts
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import axiosInstance from "@/lib/axios";

export const getNameList = async (params?: Record<string, unknown>) => {
  const response = await axiosInstance.get(API_ENDPOINTS.NAME_LIST, { params });
  return response.data;
};

export const createName = async (data: CreateNameInput) => {
  const response = await axiosInstance.post(API_ENDPOINTS.NAME_ADD, data);
  return response.data;
};

export const getNameDetails = async (id: number) => {
  const response = await axiosInstance.get(API_ENDPOINTS.NAME_EDIT, { params: { id } });
  return response.data;
};

export const updateName = async (data: UpdateNameInput) => {
  const response = await axiosInstance.post(API_ENDPOINTS.NAME_UPDATE, data);
  return response.data;
};

export const deleteName = async (id: number) => {
  const response = await axiosInstance.post(API_ENDPOINTS.NAME_DELETE, { id });
  return response.data;
};
```

## Response Format

```json
{
  "status": true,
  "message": "Success message",
  "data": { ... }
}
```

## Error Response

```json
{
  "status": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  }
}
```

## Kontrol Listesi

- [ ] Controller oluşturuldu
- [ ] FormRequest validation yazıldı
- [ ] Route tanımlandı (admin-api.php)
- [ ] Middleware eklendi (auth:sanctum)
- [ ] Admin panel endpoint eklendi
- [ ] Admin panel action yazıldı
- [ ] Test edildi
