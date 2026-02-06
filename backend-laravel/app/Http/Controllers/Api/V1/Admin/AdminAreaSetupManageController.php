<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\AreaCreateRequest;
use App\Http\Requests\StoreAreaSettingsRequest;
use App\Http\Resources\Admin\AdminAreaSettingsDetailsResource;
use App\Http\Resources\Admin\AreaDetailsResource;
use App\Http\Resources\Admin\AreaResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Interfaces\ComAreaInterface;
use App\Interfaces\TranslationInterface;
use App\Models\StoreArea;
use App\Models\StoreAreaSetting;
use App\Models\StoreAreaSettingRangeCharge;
use App\Services\AreaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAreaSetupManageController extends Controller
{
    public function __construct(
        protected ComAreaInterface     $areaRepo,
        protected TranslationInterface $transRepo,
        protected AreaService          $areaService,
    )
    {
    }

    public function index(Request $request)
    {
        $areas = $this->areaRepo->getPaginatedList(
            $request->limit ?? 10,
            $request->page ?? 1,
            app()->getLocale() ?? DEFAULT_LANGUAGE,
            $request->search ?? "",
            $request->sortField ?? 'id',
            $request->sort ?? 'asc',
            []
        );
        return response()->json([
            'data' => AreaResource::collection($areas),
            'meta' => new PaginationResource($areas),
        ]);
    }

    public function store(AreaCreateRequest $request): JsonResponse
    {
        try {
            $area = $this->areaRepo->store($this->areaService->prepareAddData($request));
            createOrUpdateTranslation($request, $area->id, 'App\Models\StoreArea', $this->areaRepo->translationKeys());

            return $this->success(translate('messages.save_success', ['name' => 'Area']));
        } catch (\Exception $e) {
            return $this->failed(translate('messages.save_failed', ['name' => 'Area']),500);
        }
    }

    public function show(Request $request)
    {
        $area = $this->areaRepo->getById($request->id);
        return response()->json($area);
    }

    public function update(AreaCreateRequest $request): JsonResponse
    {
        try {
            $area = $this->areaRepo->update($this->areaService->prepareAddData($request), $request->id);
            createOrUpdateTranslation($request, $area->id, 'App\Models\StoreArea', $this->areaRepo->translationKeys());
            return $this->success(translate('messages.update_success', ['name' => 'Area']));
        } catch (\Exception $e) {
            return $this->failed(translate('messages.update_failed', ['name' => 'Area']),500);
        }
    }

    public function changeStatus(Request $request)
    {
        try {
            $area = StoreArea::findOrFail($request->id);
            $area->status = !$area->status;
            $area->save();
            return $this->success(translate('messages.status_change_success'));
        } catch (\Exception $e) {
            return $this->failed(translate('messages.update_failed', ['name' => 'Area']),500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $this->areaRepo->delete($id);
        return $this->success(translate('messages.delete_success'));
    }

    public function updateStoreAreaSetting(StoreAreaSettingsRequest $request)
    {
        DB::beginTransaction(); // Start transaction

        try {
            // Update or Create Store Area Setting
            $storeAreaSetting = StoreAreaSetting::updateOrCreate(
                ['store_area_id' => $request->store_area_id],
                $request->except(['store_type_ids', 'charges']) // Exclude unnecessary fields
            );
            // Sync store types only if provided
            if (!empty($request->store_type_ids)) {
                $storeAreaSetting->storeTypes()->sync($request->store_type_ids);
            }
            // Delete the existing charges for the store area setting
            StoreAreaSettingRangeCharge::where('store_area_setting_id', $storeAreaSetting->id)->delete();
            // Insert new charges
            if (!empty($request->charges)) {
                $chargeData = array_map(function ($charge) use ($storeAreaSetting) {
                    return [
                        'store_area_setting_id' => $storeAreaSetting->id,
                        'min_km' => $charge['min_km'],
                        'max_km' => $charge['max_km'],
                        'charge_amount' => $charge['charge_amount'],
                        'status' => $charge['status'] ?? 1, // Default to active
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }, $request->charges);
                // Insert the new charges in bulk
                StoreAreaSettingRangeCharge::insert($chargeData);
            }
            DB::commit();
            return response()->json([
                'message' => __('messages.update_success', ['name' => 'Store Area Settings']),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Store Area Settings']),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeAreaSettingsDetails(Request $request)
    {
        $storeAreaSettings = StoreAreaSetting::with(['storeTypes','rangeCharges'])->where('store_area_id', $request->store_area_id)->first();
        if ($storeAreaSettings) {
            return response()->json(new AdminAreaSettingsDetailsResource($storeAreaSettings), 200);
        }  else {
            return response()->json(['message' => __('messages.settings_not_created_yet')], 200);
        }
    }

}
