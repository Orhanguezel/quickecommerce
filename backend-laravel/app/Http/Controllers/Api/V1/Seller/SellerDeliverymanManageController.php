<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\DeliverymanRequest;
use App\Http\Requests\VehicleTypeRequest;
use App\Http\Resources\Admin\AdminDeliverymanDetailsResource;
use App\Http\Resources\Admin\AdminVehicleDetailsResource;
use App\Http\Resources\Admin\AdminVehicleResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Seller\SellerDeliverymanResource;
use App\Interfaces\DeliverymanManageInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerDeliverymanManageController extends Controller
{
    public function __construct(protected DeliverymanManageInterface $deliverymanRepo)
    {

    }

    public function listDeliverymen(Request $request)
    {

        $filters = [
            'search' => $request->input('search', null),
            'vehicle_type_id' => $request->input('vehicle_type_id', null),
            'area_id' => $request->input('area_id', null),
            'status' => $request->input('status', null),
            'identification_type' => $request->input('identification_type', null),
            'created_by' => $request->input('created_by', null),
            'per_page' => $request->input('per_page', 10) // Default to 10 if not provided
        ];
        $deliverymen = $this->deliverymanRepo->getAllDeliveryman($filters);
        return response()->json([
            'data' => SellerDeliverymanResource::collection($deliverymen),
            'meta' => new PaginationResource($deliverymen),
        ]);
    }

    public function createDeliveryman(DeliverymanRequest $request)
    {
        $deliveryman = $this->deliverymanRepo->store($request->all());
        if ($deliveryman) {
            return $this->success(__('messages.save_success', ['name' => 'Deliveryman']));
        } else {
            return $this->failed(__('messages.save_failed', ['name' => 'Deliveryman']));
        }
    }

    public function updateDeliveryman(DeliverymanRequest $request)
    {
        $deliveryman = $this->deliverymanRepo->update($request->all());
        if ($deliveryman) {
            return $this->success(__('messages.update_success', ['name' => 'Deliveryman']));
        } else {
            return $this->failed(__('messages.update_failed', ['name' => 'Deliveryman']));
        }
    }

    public function getDeliverymanById(Request $request)
    {
        $deliveryman = $this->deliverymanRepo->getDeliverymanById($request->id);
        return response()->json(new AdminDeliverymanDetailsResource($deliveryman));
    }

    public function deleteDeliveryman(int $id)
    {
        $deleted = $this->deliverymanRepo->delete($id);
        if ($deleted) {
            return $this->success(__('messages.delete_success', ['name' => 'Deliveryman']));
        } else {
            return $this->failed(__('messages.delete_failed', ['name' => 'Deliveryman']));
        }
    }

    public function changeDeliverymanStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'deliveryman_ids*' => 'required|array',
            'status' => 'required|integer|in:0,1,2',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $success = $this->deliverymanRepo->changeStatus($request->all());
        if ($success) {
            return $this->success(__('messages.update_success', ['name' => 'Deliveryman status']));
        } else {
            return $this->failed(__('messages.update_failed', ['name' => 'Deliveryman status']));
        }
    }

    public function listVehicles(Request $request)
    {
        $filters = [
            'search' => $request->input('search', null),
            'min_capacity' => $request->input('min_capacity', null),
            'max_capacity' => $request->input('max_capacity', null),
            'speed_range' => $request->input('speed_range', null),
            'created_by' => $request->input('created_by', null),
            'store_id' => $request->input('store_id', null),
            'fuel_types' => $request->input('fuel_types', []),
            'min_distance' => $request->input('min_distance', null),
            'max_distance' => $request->input('max_distance', null),
            'max_extra_charge' => $request->input('max_extra_charge', null),
            'min_fuel_cost' => $request->input('min_fuel_cost', null),
            'max_fuel_cost' => $request->input('max_fuel_cost', null),
            'status' => $request->input('status', null),
            'sort_by' => $request->input('sort_by', 'name'),
            'sort_order' => $request->input('sort_order', 'asc'),
            'per_page' => $request->input('per_page', 10),
        ];
        $vehicles = $this->deliverymanRepo->getAllVehicles($filters);
        return response()->json(
            [
                'data' => AdminVehicleResource::collection($vehicles),
                'meta' => new PaginationResource($vehicles),
            ]
        );
    }

    public function addVehicle(VehicleTypeRequest $request)
    {
        $vehicle = $this->deliverymanRepo->addVehicle($request->all());
        createOrUpdateTranslation($request, $vehicle, 'App\Models\VehicleType', $this->deliverymanRepo->translationKeys());
        if ($vehicle) {
            return $this->success(__('messages.save_success', ['name' => 'Vehicle type']));
        } else {
            return $this->failed(__('messages.save_failed', ['name' => 'Vehicle type']));
        }
    }

    public function getVehicleById(Request $request)
    {
        $vehicle = $this->deliverymanRepo->getVehicleById($request->id);
        if ($vehicle) {
            return response()->json(new AdminVehicleDetailsResource($vehicle));
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 404,
            ]);
        }
    }

    public function updateVehicle(VehicleTypeRequest $request)
    {
        $vehicle = $this->deliverymanRepo->updateVehicle($request->all());
        createOrUpdateTranslation($request, $vehicle, 'App\Models\VehicleType', $this->deliverymanRepo->translationKeys());
        if ($vehicle) {
            return $this->success(__('messages.update_success', ['name' => 'Vehicle type']));
        } else {
            return $this->failed(__('messages.update_failed', ['name' => 'Vehicle type']));
        }
    }

    public function destroyVehicle(int $id)
    {
        $success = $this->deliverymanRepo->deleteVehicle($id);
        if ($success) {
            return $this->success(__('messages.delete_success', ['name' => 'Vehicle type']));
        } else {
            return $this->failed(__('messages.delete_failed', ['name' => 'Vehicle type']));
        }
    }

    public function changeVehicleStatus(Request $request)
    {
        $success = $this->deliverymanRepo->toggleVehicleStatus($request->id);
        if ($success) {
            return $this->success(__('messages.update_success', ['name' => 'Vehicle type status']));
        } else {
            return $this->failed(__('messages.update_failed', ['name' => 'Vehicle type status']));
        }
    }
}
