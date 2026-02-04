<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\DynamicFieldRequest;
use App\Http\Resources\Admin\DynamicFieldForProductCreateResource;
use App\Http\Resources\Admin\DynamicFieldResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Interfaces\DynamicFieldInterface;
use App\Models\DynamicField;
use App\Models\ProductSpecification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class DynamicFieldsManageController extends Controller
{
    public function __construct(protected DynamicFieldInterface $dynamicFieldRepo) {

    }

    // Add constants for default values
    private const DEFAULT_LIMIT = 10;
    private const DEFAULT_PAGE = 1;
    private const DEFAULT_SORT_FIELD = 'id';
    private const DEFAULT_SORT_DIRECTION = 'asc';
    private const MAX_LIMIT = 100;

    private function normalizeTranslations(Request $request): void
    {
        $existing = $request->input('translations');
        if (is_array($existing) && count($existing) > 0) {
            return;
        }

        $json = $request->input('translations_json');
        if (empty($json)) {
            return;
        }

        if (is_string($json)) {
            $decoded = json_decode($json, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $json = $decoded;
            }
        }

        if (!is_array($json)) {
            return;
        }

        $keys = $this->dynamicFieldRepo->translationKeys();
        $keys = is_array($keys) ? $keys : [];

        $translations = [];
        foreach ($json as $lang => $block) {
            if (!is_array($block)) continue;
            $row = ['language_code' => $lang];
            foreach ($keys as $key) {
                if (array_key_exists($key, $block)) {
                    $row[$key] = $block[$key];
                }
            }
            $translations[] = $row;
        }

        if (!empty($translations)) {
            $request->merge(['translations' => $translations]);
        }
    }

    public function list(Request $request)
    {

        // Validate input parameters
        $validated = $request->validate([
            'limit' => 'integer|min:1|max:' . self::MAX_LIMIT,
            'page' => 'integer|min:1',
            'language' => 'string|max:10',
            'search' => 'string|max:255',
            'sortField' => 'string|in:id,name,created_at,updated_at',
            'sort' => 'string|in:asc,desc',
        ]);

        // Use validated data with fallbacks
        $params = [
            'limit' => $validated['limit'] ?? self::DEFAULT_LIMIT,
            'page' => $validated['page'] ?? self::DEFAULT_PAGE,
            'language' => $validated['language'] ?? config('app.default_language', DEFAULT_LANGUAGE),
            'search' => $validated['search'] ?? '',
            'sortField' => $validated['sortField'] ?? self::DEFAULT_SORT_FIELD,
            'sort' => $validated['sort'] ?? self::DEFAULT_SORT_DIRECTION,
            'filters' => []
        ];

        // get paginated data
        $dynamic_field = $this->dynamicFieldRepo->getPaginatedDynamicField(...array_values($params));

        return response()->json([
            'success' => true,
            'data'=> DynamicFieldResource::collection($dynamic_field),
            'meta'=> new PaginationResource($dynamic_field),
        ],200);
    }


    public function getDynamicOptionForProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_type' => 'required|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ]);
        }

        // return data
        $dynamic_field = $this->dynamicFieldRepo->getDynamicOptionForProduct($request->store_type);

        // if data not fund
        if ($dynamic_field === false){
            return response()->json([
                "massage" => "Data was not found"
            ], 404);
        }

        return response()->json([
            'data' => DynamicFieldForProductCreateResource::collection($dynamic_field),
        ]);
    }

    public function createDynamicField(DynamicFieldRequest $request): JsonResponse
    {
        $this->normalizeTranslations($request);
        $dynamic_field = $this->dynamicFieldRepo->store($request->all());
        createOrUpdateTranslation($request, $dynamic_field, 'App\Models\DynamicField', $this->dynamicFieldRepo->translationKeys());
        if ($dynamic_field) {
            return $this->success(translate('messages.save_success', ['name' => 'Dynamic Field']));
        } else {
            return $this->failed(translate('messages.save_failed', ['name' => 'Dynamic Field']));
        }
    }

    public function getDynamicFieldById(Request $request)
    {
        $dynamic_field = $this->dynamicFieldRepo->getDynamicFieldById($request->id);
        if ($dynamic_field === false){
            return response()->json([
                "massage" => "Data was not found"
            ], 404);
        }

        return response()->json(new DynamicFieldResource($dynamic_field));
    }
    public function updateDynamicField(DynamicFieldRequest $request)
    {
        $this->normalizeTranslations($request);
        $dynamic_field = $this->dynamicFieldRepo->update($request->all());
        createOrUpdateTranslation($request, $dynamic_field, 'App\Models\DynamicField', $this->dynamicFieldRepo->translationKeys());
        if ($dynamic_field) {
            return $this->success(translate('messages.update_success', ['name' => 'Dynamic Field']));
        } else {
            return $this->failed(translate('messages.update_failed', ['name' => 'Dynamic Field']));
        }
    }
    public function deleteDynamicField($id)
    {
        // Check if the dynamic field exists in any product specification
        if (ProductSpecification::where('dynamic_field_id', $id)->exists()) {
            return $this->failed(translate('messages.cannot_delete_in_use'));
        }

        if (!DynamicField::where('id', $id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => __('Dynamic Field Not Found')
            ],404);
        }

        $this->dynamicFieldRepo->delete($id);
        return $this->success(translate('messages.delete_success'));
    }

    public function changeDynamicFieldStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:dynamic_fields,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $dynamic_field = DynamicField::find($request->id);
        if ($dynamic_field) {
            $is_req =  $dynamic_field->is_required ? 0 : 1;
            $dynamic_field->update(['is_required' => $is_req]);
            return response()->json([
                "message" => __("messages.status_is_required"),
            ], 200);
        } else {
            return response()->json([
                "message" => __("messages.data_not_found"),
            ], 404);
        }
    }

}
