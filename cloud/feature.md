Yeni bir özellik geliştir: $ARGUMENTS

Aşağıdaki adımları sırasıyla uygula:

## 1. Analiz & Planlama

- Mevcut kod tabanını tara ve ilgili dosyaları bul
- Bu özelliğin hangi katmanlara dokunacağını belirle
- Bağımlılıkları ve etkilenen modülleri listele
- Planı onayım için sun

### QuickEcommerce Katman Yapısı

```
Backend (Laravel):
├── app/Http/Controllers/Api/Admin/  ← Admin controller'lar
├── app/Http/Controllers/Api/V1/     ← Public API
├── app/Models/                       ← Eloquent modeller
├── app/Repositories/                 ← Repository pattern
├── app/Services/                     ← Business logic
├── routes/admin-api.php              ← Admin route'lar
└── database/migrations/              ← Migrations

Admin Panel (Next.js):
├── src/modules/admin-section/[name]/ ← Module dosyaları
│   ├── [name].action.ts              ← API calls
│   ├── [name].schema.ts              ← Zod schemas
│   ├── [name].service.ts             ← Service layer
│   └── [name].type.ts                ← Types
├── src/endpoints/AdminApiEndPoints.ts ← Endpoint tanımları
└── src/app/[locale]/admin/[name]/    ← Page components
```

## 2. Backend Geliştirme (Laravel)

### a) Migration

```php
// database/migrations/YYYY_MM_DD_HHMMSS_create_table_name.php
Schema::create('table_name', function (Blueprint $table) {
    $table->id();
    // ... alanlar
    $table->timestamps();
    $table->softDeletes();
});
```

### b) Model

```php
// app/Models/ModelName.php
class ModelName extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['field1', 'field2'];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
```

### c) Repository

```php
// app/Repositories/ModelNameRepository.php
class ModelNameRepository extends BaseRepository
{
    public function model(): string
    {
        return ModelName::class;
    }
}
```

### d) Controller

```php
// app/Http/Controllers/Api/Admin/ModelNameController.php
class ModelNameController extends Controller
{
    public function index(Request $request) { ... }
    public function store(StoreRequest $request) { ... }
    public function show($id) { ... }
    public function update(UpdateRequest $request, $id) { ... }
    public function destroy($id) { ... }
}
```

### e) Routes

```php
// routes/admin-api.php
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('model-name', ModelNameController::class);
});
```

## 3. Admin Panel Geliştirme (Next.js)

### a) Endpoint Tanımları

```typescript
// src/endpoints/AdminApiEndPoints.ts
MODEL_NAME_LIST: "v1/admin/model-name/list",
MODEL_NAME_ADD: "v1/admin/model-name/add",
MODEL_NAME_EDIT: "v1/admin/model-name/details",
MODEL_NAME_UPDATE: "v1/admin/model-name/update",
MODEL_NAME_DELETE: "v1/admin/model-name/remove",
```

### b) Types

```typescript
// src/modules/admin-section/model-name/model-name.type.ts
export interface ModelName {
  id: number;
  field1: string;
  created_at: string;
}
```

### c) Zod Schema

```typescript
// src/modules/admin-section/model-name/model-name.schema.ts
import { z } from "zod";

export const modelNameSchema = z.object({
  field1: z.string().min(1, "Required"),
});
```

### d) Actions

```typescript
// src/modules/admin-section/model-name/model-name.action.ts
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import axiosInstance from "@/lib/axios";

export const getModelNameList = async (params: QueryParams) => {
  const response = await axiosInstance.get(API_ENDPOINTS.MODEL_NAME_LIST, { params });
  return response.data;
};
```

### e) Route Config

```typescript
// src/config/routes.ts
modelNameList: "/admin/model-name/list",
addModelName: "/admin/model-name/add",
editModelName: "/admin/model-name/edit",
```

## 4. Test & Kontrol

```bash
# Backend
cd backend-laravel
php artisan migrate
php artisan test

# Admin Panel
cd admin-panel
npm run lint
npm run build
```

## Kontrol Listesi

- [ ] Laravel migration oluşturuldu
- [ ] Eloquent model yazıldı
- [ ] Repository (gerekiyorsa) eklendi
- [ ] Controller ve routes eklendi
- [ ] FormRequest validation yazıldı
- [ ] Admin panel endpoint tanımları eklendi
- [ ] Types ve schemas yazıldı
- [ ] Actions (API calls) yazıldı
- [ ] Page components oluşturuldu
- [ ] Routes config güncellendi
- [ ] Build hatasız çalışıyor
