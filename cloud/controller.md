Laravel controller oluştur: $ARGUMENTS

## Laravel Controller Pattern

### Admin Controller

```php
// app/Http/Controllers/Api/Admin/[Name]Controller.php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\[Name]\StoreRequest;
use App\Http\Requests\Admin\[Name]\UpdateRequest;
use App\Models\[Name];
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class [Name]Controller extends Controller
{
    /**
     * List all items with filters and pagination
     */
    public function list(Request $request): JsonResponse
    {
        $query = QueryBuilder::for([Name]::class)
            ->allowedFilters([
                'name',
                'status',
                AllowedFilter::scope('search'),
            ])
            ->allowedSorts(['id', 'name', 'created_at'])
            ->defaultSort('-created_at');

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
        $data = [Name]::create($request->validated());

        return response()->json([
            'status' => true,
            'message' => '[Name] created successfully',
            'data' => $data,
        ], 201);
    }

    /**
     * Get item details
     */
    public function details(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|exists:[table_name],id']);

        $item = [Name]::findOrFail($request->id);

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
        $item = [Name]::findOrFail($request->id);
        $item->update($request->validated());

        return response()->json([
            'status' => true,
            'message' => '[Name] updated successfully',
            'data' => $item->fresh(),
        ]);
    }

    /**
     * Remove item (soft delete)
     */
    public function remove(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|exists:[table_name],id']);

        $item = [Name]::findOrFail($request->id);
        $item->delete();

        return response()->json([
            'status' => true,
            'message' => '[Name] deleted successfully',
        ]);
    }

    /**
     * Change status
     */
    public function changeStatus(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|exists:[table_name],id']);

        $item = [Name]::findOrFail($request->id);
        $item->update(['status' => !$item->status]);

        return response()->json([
            'status' => true,
            'message' => 'Status changed successfully',
            'data' => $item->fresh(),
        ]);
    }
}
```

### Customer API Controller

```php
// app/Http/Controllers/Api/V1/[Name]Controller.php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\[Name];
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class [Name]Controller extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = [Name]::query()
            ->where('status', true)
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'status' => true,
            'data' => $data,
        ]);
    }

    public function show($id): JsonResponse
    {
        $item = [Name]::where('status', true)->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $item,
        ]);
    }
}
```

### Form Request (Store)

```php
// app/Http/Requests/Admin/[Name]/StoreRequest.php
<?php

namespace App\Http\Requests\Admin\[Name];

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
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

    public function messages(): array
    {
        return [
            'name.required' => 'Name field is required',
        ];
    }
}
```

### Form Request (Update)

```php
// app/Http/Requests/Admin/[Name]/UpdateRequest.php
<?php

namespace App\Http\Requests\Admin\[Name];

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:[table_name],id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ];
    }
}
```

### Route Kaydı

```php
// routes/admin-api.php
use App\Http\Controllers\Api\Admin\[Name]Controller;

Route::prefix('v1/admin/[name]')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/list', [[Name]Controller::class, 'list']);
    Route::post('/add', [[Name]Controller::class, 'store']);
    Route::get('/details', [[Name]Controller::class, 'details']);
    Route::post('/update', [[Name]Controller::class, 'update']);
    Route::post('/remove', [[Name]Controller::class, 'remove']);
    Route::post('/change-status', [[Name]Controller::class, 'changeStatus']);
});
```

## Kontrol Listesi

- [ ] Controller dosyası oluşturuldu
- [ ] StoreRequest validation yazıldı
- [ ] UpdateRequest validation yazıldı
- [ ] Route'lar eklendi (admin-api.php veya api.php)
- [ ] Middleware doğru (auth:sanctum)
- [ ] Response format tutarlı
- [ ] Error handling mevcut
