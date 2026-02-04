<?php

namespace App\Repositories;

use App\Enums\OrderActivityType;
use App\Enums\WalletOwnerType;
use App\Interfaces\DeliverymanManageInterface;
use App\Mail\DynamicEmail;
use App\Models\DeliveryMan;
use App\Models\EmailTemplate;
use App\Models\Order;
use App\Models\OrderActivity;
use App\Models\OrderDeliveryHistory;
use App\Models\SystemCommission;
use App\Models\Translation;
use App\Models\User;
use App\Models\VehicleType;
use App\Services\Order\OrderManageNotificationService;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Modules\Wallet\app\Models\Wallet;
use Modules\Wallet\app\Models\WalletTransaction;

class DeliverymanManageRepository implements DeliverymanManageInterface
{
    protected $deliveryman;
    protected $orderManageNotificationService;

    public function __construct(protected VehicleType $vehicleType, protected Translation $translation, OrderManageNotificationService $orderManageNotificationService)
    {
        $this->deliveryman = auth('api')->user();
        $this->orderManageNotificationService = $orderManageNotificationService;
    }

    public function translationKeys(): mixed
    {
        return $this->vehicleType->translationKeys;
    }

    public function change_password(int $deliveryman_id, string $password)
    {
        if (auth('api')->check()) {
            unauthorized_response();
        }
        $deliveryman = User::where('id', $deliveryman_id)->where('activity_scope', 'delivery_level')->first();
        if (!$deliveryman) {
            return false;
        }
        $deliveryman->password = Hash::make($password);
        $deliveryman->save();
        return $deliveryman;
    }

    public function getAllDeliveryman(array $filters)
    {
        $query = User::with([
            'deliveryman',
            'deliveryman.vehicle_type.related_translations',
            'deliveryman.area.related_translations',
            'deliveryman.creator',
            'deliveryman.updater'
        ])
            ->where('activity_scope', 'delivery_level')
            ->whereNull('deleted_at');

        // Search on User name
        if (!empty($filters['search'])) {
            $searchTerms = preg_split('/\s+/', trim($filters['search']));
            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->where(function ($subQ) use ($term) {
                        $subQ->where('first_name', 'like', "%$term%")
                            ->orWhere('last_name', 'like', "%$term%");
                    });
                }
            });
        }

        // Filters from related DeliveryMan model
        $query->whereHas('deliveryman', function ($q) use ($filters) {
            if (!empty($filters['vehicle_type_id'])) {
                $q->where('vehicle_type_id', $filters['vehicle_type_id']);
            }

            if (!empty($filters['area_id'])) {
                $q->where('area_id', $filters['area_id']);
            }

            if (isset($filters['status'])) {
                $q->where('status', $filters['status']);
            }

            if (!empty($filters['identification_type'])) {
                $q->where('identification_type', 'like', '%' . $filters['identification_type'] . '%');
            }

            if (!empty($filters['created_by'])) {
                $q->where('created_by', $filters['created_by']);
            }
        });

        return $query->latest()->paginate($filters['per_page'] ?? 10);
    }

    public function store(array $data)
    {
        DB::beginTransaction();


        // Create the deliveryman user record
        $deliveryman = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'] ?? null,
            'slug' => username_slug_generator($data['first_name'], $data['last_name']),
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'],
            'activity_scope' => 'delivery_level',
            'password' => $data['password'],
            'store_owner' => 0,
            'store_seller_id' => null,
            'stores' => null,
            'status' => 1,
        ]);

        if (!$deliveryman) {
            DB::rollBack();
            return null;
        }
        $deliverymanExtra = DeliveryMan::create([
            'user_id' => $deliveryman->id,
            'store_id' => $data['store_id'] ?? null,
            'vehicle_type_id' => $data['vehicle_type_id'] ?? null,
            'area_id' => $data['area_id'] ?? null,
            'identification_type' => $data['identification_type'],
            'identification_number' => $data['identification_number'],
            'identification_photo_front' => $data['identification_photo_front'] ?? null,
            'identification_photo_back' => $data['identification_photo_back'] ?? null,
            'address' => $data['address'] ?? null,
            'status' => 'approved',
            'created_by' => auth('api')->user()->id,
        ]);


        if (!$deliverymanExtra) {
            DB::rollBack();
            return false;
        }

        DB::commit();
        return $deliveryman->id;

    }

    public function update(array $data)
    {
        DB::beginTransaction();
        // Find the existing user record
        $user = User::find($data['user_id']);
        if (!$user) {
            DB::rollBack();
            return null;  // Return null if user does not exist
        }

        // Update the deliveryman user record
        $user->update([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'] ?? null,
            'slug' => username_slug_generator($data['first_name'], $data['last_name']),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'activity_scope' => 'delivery_level',
            'store_owner' => 0,
            'store_seller_id' => null,
            'stores' => null,
            'status' => $data['status'] ?? 0,
        ]);

        // Find and update the associated DeliveryMan record
        $deliveryman = DeliveryMan::where('user_id', $data['user_id'])->first();

        if (!$deliveryman) {
            DB::rollBack();
            return null;  // Return null if DeliveryMan does not exist
        }

        // Update the DeliveryMan extra details
        $deliveryman->update([
            'vehicle_type_id' => $data['vehicle_type_id'] ?? null,
            'store_id' => $data['store_id'] ?? null,
            'area_id' => $data['area_id'] ?? null,
            'identification_type' => $data['identification_type'] ?? null,
            'identification_number' => $data['identification_number'] ?? null,
            'identification_photo_front' => $data['identification_photo_front'] ?? null,
            'identification_photo_back' => $data['identification_photo_back'] ?? null,
            'address' => $data['address'] ?? null,
            'updated_by' => auth('api')->user()->id,
        ]);
        DB::commit();  // Commit transaction if all updates succeed
        return $user->id;  // Return user ID on success

    }

    public function getDeliverymanById(int $id)
    {
        $deliveryman = DeliveryMan::with('user', 'vehicle_type', 'area', 'creator', 'updater')
            ->find($id);
        if (!$deliveryman) {
            return false;
        }
        return $deliveryman;
    }

    public function delete(int $userId)
    {
        DB::beginTransaction();
        $user = User::find($userId);
        if (!$user) {
            DB::rollBack();
            return false;
        }
        $deliveryman = DeliveryMan::where('user_id', $userId)->first();
        if ($deliveryman) {
            $deliveryman->delete();
        }
        $user->delete();

        DB::commit();
        return true;

    }

    public function getDeliverymanRequests()
    {
        try {
            $deliverymen = DeliveryMan::with([
                'user',
                'vehicle_type',
                'area',
                'creator',
                'updater'
            ])
                ->where('deleted_at', null)
                ->where('status', 'pending')
                ->paginate(10);
            return $deliverymen;
        } catch (\Exception $exception) {
            return false;
        }
    }

    public function approveDeliverymen(array $deliveryman_ids)
    {
        try {
            $deliverymen = DeliveryMan::whereIn('id', $deliveryman_ids)
                ->where('deleted_at', null)
                ->update(['status' => 'approved']);
            return $deliverymen > 0;
        } catch (\Exception $exception) {
            return false;
        }
    }

    public function rejectDeliverymen(array $deliveryman_ids)
    {
        try {
            $deliverymen = DeliveryMan::whereIn('id', $deliveryman_ids)
                ->where('deleted_at', null)
                ->update(['status' => 'rejected']);
            return $deliverymen > 0;
        } catch (\Exception $exception) {
            return false;
        }
    }

    public function changeStatus(array $data)
    {
        try {
            return DeliveryMan::where('id', $data['id'])
                ->where('deleted_at', null)
                ->update(['status' => $data['status']]);

        } catch (\Exception $exception) {
            return false;
        }
    }

    public function getAllVehicles(array $filters)
    {
        $query = VehicleType::query();

        if (isset($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', $searchTerm)
                    ->orWhere('description', 'LIKE', $searchTerm)
                    ->orWhereHas('related_translations', function ($q) use ($searchTerm) {
                        $q->whereIn('key', ['name', 'description'])
                            ->where('value', 'LIKE', $searchTerm);
                    });
            });
        }
        // Filter by capacity (e.g., minimum and maximum capacity)
        if (isset($filters['min_capacity'])) {
            $query->where('capacity', '>=', $filters['min_capacity']);
        }
        if (isset($filters['max_capacity'])) {
            $query->where('capacity', '<=', $filters['max_capacity']);
        }

        // Filter by speed range (e.g., vehicles with a certain speed range)
        if (isset($filters['speed_range'])) {
            $query->where('speed_range', $filters['speed_range']);
        }
        // Filter by creator
        if (isset($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }
        // Filter by store
        if (isset($filters['store_id'])) {
            $query->where('store_id', $filters['store_id']);
        }

        // Filter by fuel type (multiple selections allowed)
        if (isset($filters['fuel_type'])) {
            $query->where('fuel_type', $filters['fuel_type']);
        }

        // Filter by maximum distance (e.g., minimum and maximum distance)
        if (isset($filters['min_distance'])) {
            $query->where('max_distance', '>=', $filters['min_distance']);
        }
        if (isset($filters['max_distance'])) {
            $query->where('max_distance', '<=', $filters['max_distance']);
        }

        // Filter by extra charge (e.g., vehicles with a certain charge or less)
        if (isset($filters['max_extra_charge'])) {
            $query->where('extra_charge', '<=', $filters['max_extra_charge']);
        }

        // Filter by average fuel cost (e.g., vehicles with a certain fuel cost range)
        if (isset($filters['min_fuel_cost'])) {
            $query->where('average_fuel_cost', '>=', $filters['min_fuel_cost']);
        }

        if (isset($filters['max_fuel_cost'])) {
            $query->where('average_fuel_cost', '<=', $filters['max_fuel_cost']);
        }

        // Filter by status (active or inactive vehicles)
        if (isset($filters['status'])) { // Check explicitly for 0 or 1
            $query->where('status', $filters['status']);
        }

        // Sort results (default to ascending order by name if not provided)
        if (isset($filters['sort_by']) && isset($filters['sort_order'])) {
            $query->orderBy($filters['sort_by'], $filters['sort_order']);
        } else {
            $query->orderBy('name', 'asc');
        }

        // Pagination (default to 10 items per page if not provided)
        $perPage = $filters['per_page'] ?? 10;
        return $query->with('related_translations')->paginate($perPage);
    }

    public function addVehicle(array $data)
    {
        $data['created_by'] = auth('api')->user()->id;
        try {
            $data = Arr::except($data, ['translations']);
            $vehicle = VehicleType::create($data);
            return $vehicle->id;
        } catch (\Throwable $th) {
            return false;
        }
    }

    public function updateVehicle(array $data)
    {

        try {
            $data = Arr::except($data, ['translations']);
            $vehicle = VehicleType::findorfail($data['id']);
            $vehicle->update($data);
            return $vehicle->id;
        } catch (\Throwable $th) {
            return false;
        }
    }

    public function getVehicleById(int $id)
    {
        try {
            $vehicle = VehicleType::with(['related_translations'])->find($id);
            if ($vehicle) {
                return $vehicle;
            } else {
                return false;
            }
        } catch (\Throwable $th) {
            return false;
        }
    }

    public function deleteVehicle(int $id)
    {
        $vehicle = VehicleType::find($id);
        if ($vehicle) {
            // Delete related translations
            $this->translation->where('translatable_type', VehicleType::class)
                ->where('translatable_id', $id)
                ->delete();
            $vehicle->delete();
            return true;
        } else {
            return false;
        }
    }

    public function getVehicleRequests()
    {
        try {
            $vehicles = VehicleType::inactiveVehicles()->paginate(10);
            return $vehicles;
        } catch (\Throwable $th) {
            return false;
        }

    }

    public function approveVehicles(array $ids)
    {
        try {
            $vehicles = VehicleType::whereIn('id', $ids)
                ->where('status', 0)
                ->update(['status' => 1]);
            return $vehicles > 0;
        } catch (\Throwable $th) {
            return false;
        }
    }

    public function toggleVehicleStatus(int $id)
    {
        try {
            $vehicle = VehicleType::findOrFail($id);
            $vehicle->status = !$vehicle->status;
            $vehicle->save();

            return true;
        } catch (\Throwable $th) {
            return false;
        }
    }

    public function vehicleTypeDropdown()
    {
        $vehicleTypes = VehicleType::where('status', 1)->get();
        if ($vehicleTypes->count() > 0) {
            return $vehicleTypes;
        } else {
            return false;
        }
    }


    public function deliverymanOrders($filters)
    {
        $deliveryman = auth('api')->user();

        $statusOrder = ['processing', 'pickup', 'shipped', 'delivered', 'ignored'];

        // Step 1: Get latest IDs of grouped delivery histories
        $historyIds = OrderDeliveryHistory::selectRaw('MAX(id) as id')
            ->where('deliveryman_id', $deliveryman->id)
            ->when(!empty($filters['status']), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->groupBy('order_id')
            ->pluck('id');

        // Step 2: Fetch full models using those IDs
        $orders = OrderDeliveryHistory::with([
            'order.orderMaster.orderAddress',
            'order.orderDetail',
            'order.store',
            'order.orderMaster.customer'
        ])
            ->whereIn('id', $historyIds)
            ->orderByRaw("FIELD(status, '" . implode("','", $statusOrder) . "')")
            ->paginate(10);

        return $orders;
    }

    public function deliverymanOrderDetails(int $order_id)
    {
        return Order::with(['orderMaster.customer', 'orderDetail.product', 'orderMaster', 'store', 'deliveryman', 'orderMaster.shippingAddress', 'refund.store', 'refund.orderRefundReason'])
            ->where('id', $order_id)
            ->where('confirmed_by', $this->deliveryman->id)
            ->first();
    }

    public function orderRequests()
    {
        $system_commission = SystemCommission::first();
        if (optional($system_commission)->order_confirmation_by === 'store') {
            return false;
        }
        $deliveryman = auth('api')->user();
        $order_requests = Order::with(['orderDeliveryHistory', 'orderMaster.orderAddress', 'store', 'orderDetail'])
            ->where('confirmed_by', $deliveryman->id)
            ->whereDoesntHave('orderDeliveryHistory', function ($query) use ($deliveryman) {
                $query->where('deliveryman_id', $deliveryman->id);
            })
            ->latest()
            ->paginate(10);

        return $order_requests;
    }

    public function updateOrderStatus(string $status, int $order_id, string $reason = null)
    {
        $deliveryman = auth('api')->user();
        DB::beginTransaction();

        try {
            $order = Order::find($order_id);
            if ($status === 'accepted') {
                if ($order->confirmed_by != $deliveryman->id) {
                    return 'already confirmed';
                }
                $already_accepted = OrderDeliveryHistory::where('order_id', $order_id)
                    ->where('deliveryman_id', $deliveryman->id)
                    ->where('status', 'accepted')
                    ->exists();
                if ($already_accepted) {
                    return 'already accepted';
                }
                $order->update([
                    'confirmed_at' => Carbon::now(),
                ]);
                OrderDeliveryHistory::create([
                    'order_id' => $order_id,
                    'deliveryman_id' => $deliveryman->id,
                    'status' => $status,
                ]);
                OrderDeliveryHistory::create([
                    'order_id' => $order_id,
                    'deliveryman_id' => $deliveryman->id,
                    'status' => $order->status,
                ]);
            }
            if ($status === 'ignored') {
                if (!$reason) {
                    return 'reason is required';
                }
                $already_ignored = OrderDeliveryHistory::where('order_id', $order_id)
                    ->where('deliveryman_id', $deliveryman->id)
                    ->where('status', 'ignored')
                    ->exists();
                if ($already_ignored) {
                    return 'already ignored';
                }
                $order->update([
                    'confirmed_by' => null,
                ]);
                OrderDeliveryHistory::create([
                    'order_id' => $order_id,
                    'deliveryman_id' => $deliveryman->id,
                    'reason' => $reason,
                    'status' => $status,
                ]);
            }

            DB::commit();
            return $status;
        } catch (\Exception $e) {
            DB::rollBack();
            return false;
        }
    }

    public function orderChangeStatus(string $status, int $order_id)
    {
        $deliveryman = auth('api')->user();
        $order = Order::with('orderMaster.customer', 'orderMaster.orderAddress', 'store', 'deliveryman')->find($order_id);
        $order_is_accepted = Order::with('orderDeliveryHistory')
            ->whereHas('orderDeliveryHistory', function ($query) use ($deliveryman, $order_id) {
                $query->where('deliveryman_id', $deliveryman->id)
                    ->where('order_id', $order_id)
                    ->where('status', 'accepted');
            })
            ->exists();

        if ($status == 'pickup') {
            if ($order->status === 'delivered') {
                return 'already delivered';
            }
            if (!$order_is_accepted) {
                return 'order_is_not_accepted';
            }
            $order->status = 'pickup';
            $order->save();
            OrderDeliveryHistory::create([
                'order_id' => $order_id,
                'deliveryman_id' => $deliveryman->id,
                'status' => $status,
            ]);
            return 'pickup';
        }

        if ($status == 'shipped') {
            if ($order->status === 'delivered') {
                return 'already delivered';
            }
            if (!$order_is_accepted) {
                return 'order_is_not_accepted';
            }
            $order->status = 'shipped';
            $order->save();
            OrderDeliveryHistory::create([
                'order_id' => $order_id,
                'deliveryman_id' => $deliveryman->id,
                'status' => $status,
            ]);
            return 'shipped';
        }

        if ($status == 'delivered') {
            if ($order->status === 'delivered') {
                return 'already delivered';
            }
            if (!$order_is_accepted) {
                return 'order_is_not_accepted';
            }
            $order->status = 'delivered';
            $order->delivery_completed_at = Carbon::now();
            $order->save();

            OrderDeliveryHistory::create([
                'order_id' => $order_id,
                'deliveryman_id' => $deliveryman->id,
                'status' => $status,
            ]);

            if ($order->orderMaster->payment_gateway === 'cash_on_delivery') {
                $order->orderMaster->payment_status = 'paid';
                $order->orderMaster->save();
                $order->payment_status = 'paid';
                $order->save();
                OrderActivity::create([
                    'order_id' => $order_id,
                    'activity_from' => 'deliveryman',
                    'activity_type' => OrderActivityType::CASH_COLLECTION->value,
                    'ref_id' => $deliveryman->id,
                    'activity_value' => $order->order_amount
                ]);
            }


            // Store wallet update
            $store_wallet = Wallet::where('owner_id', $order->store_id)
                ->where('owner_type', WalletOwnerType::STORE->value)
                ->first();

            // Deliveryman wallet update
            $deliveryman_wallet = Wallet::where('owner_id', $deliveryman->id)
                ->where('owner_type', WalletOwnerType::DELIVERYMAN->value)
                ->first();

            if ($deliveryman_wallet || $store_wallet) {
                if (!empty($store_wallet)) {
                    // Store Update wallet balance
                    $store_wallet->balance += $order->order_amount_store_value; // Add earnings to the balance
                    $store_wallet->earnings += $order->order_amount_store_value;
                    $store_wallet->save();

                    // Store Create wallet transaction history
                    WalletTransaction::create([
                        'wallet_id' => $store_wallet->id,
                        'amount' => $order->order_amount_store_value,
                        'type' => 'credit',
                        'purpose' => 'Order  Earnings',
                        'status' => 1,
                    ]);
                }


                if (!empty($deliveryman_wallet)) {
                    // Deliveryman Update wallet balance
                    $deliveryman_wallet->balance += $order->delivery_charge_admin; // Add earnings to the balance
                    $deliveryman_wallet->earnings += $order->delivery_charge_admin;
                    $deliveryman_wallet->save();

                    // Deliveryman Create wallet transaction history
                    WalletTransaction::create([
                        'wallet_id' => $deliveryman_wallet->id,
                        'amount' => $order->delivery_charge_admin,
                        'type' => 'credit',
                        'purpose' => 'Delivery Earnings',
                        'status' => 1,
                    ]);
                }

                // send mail and notification
                $customer_email = $order->orderAddress?->email ?? $order->orderMaster?->customer?->email;
                $store_email = $order->store?->email;
                $system_global_email = com_option_get('com_site_email');
                $delivery_man = $order->deliveryman?->email;

                $this->orderManageNotificationService->createOrderNotification($order->id);


                // mail send
                try {
                    // order notification
                    $email_template_deliveryman = EmailTemplate::where('type', 'deliveryman-earning')->where('status', 1)->first();
                    $email_template_order_delivered = EmailTemplate::where('type', 'order-status-delivered')->where('status', 1)->first();
                    $email_template_order_store = EmailTemplate::where('type', 'order-status-delivered-store')->where('status', 1)->first();
                    $email_template_order_admin = EmailTemplate::where('type', 'order-status-delivered-admin')->where('status', 1)->first();

                    // customer, store and admin
                    $customer_subject = $email_template_order_delivered->subject;
                    $store_subject = $email_template_order_store->subject;
                    $admin_subject = $email_template_order_admin->subject;
                    $deliveryman_subject = $email_template_deliveryman->subject;

                    $customer_message = $email_template_order_delivered->body;
                    $store_message = $email_template_order_store->body;
                    $admin_message = $email_template_order_admin->body;
                    $deliveryman_message = $email_template_deliveryman->body;

                    $order_amount = amount_with_symbol_format($order->order_amount);

                    $customer_message = str_replace(["@customer_name", "@order_id", "@order_amount"],
                        [
                            $order->orderMaster?->customer?->full_name,
                            $order->id,
                            $order_amount,
                        ], $customer_message);

                    $store_message = str_replace(["@store_name", "@order_id", "@order_amount_for_store"],
                        [
                            $order->store?->name,
                            $order->id,
                            amount_with_symbol_format($order->order_amount_store_value),
                        ], $store_message);

                    $admin_message = str_replace(["@order_id", "@order_amount_admin_commission", "@delivery_charge_commission_amount"],
                        [
                            $order->id,
                            amount_with_symbol_format($order->order_amount_admin_commission),
                            amount_with_symbol_format($order->delivery_charge_admin_commission),
                        ], $admin_message);

                    $deliveryman_message = str_replace(["@name", "@order_id", "@order_amount", "@earnings_amount"],
                        [
                            auth('api')->user()->full_name,
                            $order->id,
                            $order_amount,
                            amount_with_symbol_format($order->delivery_charge_admin)
                        ], $deliveryman_message);


                    // customer
                    Mail::to($customer_email)->send(new DynamicEmail($customer_subject, (string)$customer_message));
                    // store
                    Mail::to($store_email)->send(new DynamicEmail($store_subject, (string)$store_message));
                    // admin
                    Mail::to($system_global_email)->send(new DynamicEmail($admin_subject, (string)$admin_message));
                    // deliveryman
                    Mail::to($delivery_man)->send(new DynamicEmail($deliveryman_subject, (string)$deliveryman_message));
                } catch (\Exception $th) {
                }
                return 'delivered';
            }

        }
    }

    public function deliverymanOrderHistory()
    {
        $deliveryman = auth('api')->user();

        if (!$deliveryman || $deliveryman->activity_scope !== 'delivery_level') {
            return 'unauthorized'; // Return 'unauthorized' if user is not a deliveryman
        }

        // Fetch the order history of the deliveryman with associated order details
        return OrderDeliveryHistory::with('order')
            ->where('deliveryman_id', $deliveryman->id)
            ->latest()
            ->paginate(10); // Paginate results
    }


    public function storeTranslation(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {
        $translations = [];
        if ($request['translations']) {
            foreach ($request['translations'] as $translation) {
                foreach ($colNames as $key) {

                    // Fallback value if translation key does not exist
                    $translatedValue = $translation[$key] ?? null;

                    // Skip translation if the value is NULL
                    if ($translatedValue === null) {
                        continue; // Skip this field if it's NULL
                    }
                    // Collect translation data
                    $translations[] = [
                        'translatable_type' => $refPath,
                        'translatable_id' => $refid,
                        'language' => $translation['language_code'],
                        'key' => $key,
                        'value' => $translatedValue,
                    ];
                }
            }
        }
        if (count($translations)) {
            $this->translation->insert($translations);
        }
        return true;
    }

    public function updateTranslation(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {
        $translations = [];
        if ($request['translations']) {
            foreach ($request['translations'] as $translation) {
                foreach ($colNames as $key) {

                    // Fallback value if translation key does not exist
                    $translatedValue = $translation[$key] ?? null;

                    // Skip translation if the value is NULL
                    if ($translatedValue === null) {
                        continue; // Skip this field if it's NULL
                    }

                    $trans = $this->translation->where('translatable_type', $refPath)->where('translatable_id', $refid)
                        ->where('language', $translation['language_code'])->where('key', $key)->first();
                    if ($trans != null) {
                        $trans->value = $translatedValue;
                        $trans->save();
                    } else {
                        $translations[] = [
                            'translatable_type' => $refPath,
                            'translatable_id' => $refid,
                            'language' => $translation['language_code'],
                            'key' => $key,
                            'value' => $translatedValue,
                        ];
                    }
                }
            }
        }
        if (count($translations)) {
            $this->translation->insert($translations);
        }
        return true;
    }

    public function deliverymanListDropdown(array $filter)
    {
        $query = User::with('deliveryman.area')->where('activity_scope', 'delivery_level')->where('is_available', true);
        if (isset($filter['search'])) {
            $search = $filter['search'];
            $query->where(function ($query) use ($search) {
                $query->where('first_name', 'like', '%' . $search . '%');
                $query->orWhere('last_name', 'like', '%' . $search . '%');
            });
        }
        return $query->limit(500)->get();
    }

    public function getDeliverymanDashboard(?int $deliveryman_id = null)
    {
        if ($deliveryman_id) {
            $deliveryman = User::where('id', $deliveryman_id)->where('activity_scope', 'delivery_level')->first();
            $this->deliveryman = $deliveryman;
        }
        $total_completed_orders = $this->getTotalCompletedOrders();
        $ongoing_orders = $this->getOngoingOrders();
        $pending_orders = $this->getPendingOrders();
        $cancelled_orders = $this->getCancelledOrders();
        $totalCashCollection = $this->totalCashCollection();
        $totalCashDeposit = $this->totalCashDeposit();
        $inHand = $totalCashCollection - $totalCashDeposit;
        $activeOrders = $this->getActiveOrders();
        $wallet = $this->wallet();
        $weeklyEarnings = $this->earnings('this_week');
        $monthlyEarnings = $this->earnings('this_month');
        $yearlyEarnings = $this->earnings('this_year');
        return [
            'total_completed_orders' => $total_completed_orders,
            'ongoing_orders' => $ongoing_orders,
            'pending_orders' => $pending_orders,
            'cancelled_orders' => $cancelled_orders,
            'total_cash_collection' => $totalCashCollection,
            'total_cash_deposit' => $totalCashDeposit,
            'in_hand' => $inHand,
            'active_orders' => $activeOrders,
            'wallet' => $wallet,
            'weekly_earnings' => $weeklyEarnings,
            'monthly_earnings' => $monthlyEarnings,
            'yearly_earnings' => $yearlyEarnings,
        ];
    }

    private function getTotalCompletedOrders()
    {
        return OrderDeliveryHistory::where('deliveryman_id', $this->deliveryman->id)
            ->where('status', 'delivered')
            ->count();
    }

    private function getOngoingOrders()
    {
        return Order::with(['orderMaster.orderAddress', 'store'])
            ->whereHas('orderDeliveryHistory', function ($query) {
                $query->where('deliveryman_id', $this->deliveryman->id)
                    ->where('status', 'accepted');
            })
            ->where('status', '!=', 'delivered')
            ->count();
    }

    private function getPendingOrders()
    {
        return Order::where('confirmed_by', $this->deliveryman->id)
            ->whereNull('confirmed_at')
            ->count();
    }

    private function getCancelledOrders()
    {
        return OrderDeliveryHistory::where('deliveryman_id', $this->deliveryman->id)
            ->where('status', 'cancelled')
            ->count();
    }

    private function totalCashCollection()
    {
        return OrderActivity::where('ref_id', $this->deliveryman->id)
            ->where('activity_type', OrderActivityType::CASH_COLLECTION->value)
            ->sum('activity_value');
    }

    private function totalCashDeposit()
    {
        return OrderActivity::where('ref_id', $this->deliveryman->id)
            ->where('activity_type', OrderActivityType::CASH_DEPOSIT->value)
            ->sum('activity_value');
    }

    private function getActiveOrders()
    {
        return Order::with(['orderMaster.orderAddress', 'store'])
            ->where('status', '!=', 'delivered') // Exclude delivered orders
            ->whereHas('orderDeliveryHistory', function ($query) {
                $query->where('deliveryman_id', $this->deliveryman->id)
                    ->where('status', 'accepted');
            })
            ->latest()
            ->first();
    }

    private function wallet()
    {
        return Wallet::where('owner_type', User::class)
            ->where('owner_id', $this->deliveryman->id)
            ->where('status', 1)
            ->first();
    }

    private function earnings($period = 'this_week')
    {
        $query = OrderDeliveryHistory::where('status', 'delivered')
            ->where('deliveryman_id', $this->deliveryman->id)
            ->whereHas('order', function ($query) {
                $query->whereNotNull('delivery_charge_admin'); // Ensure admin charge exists
            })
            ->with('order');

        // Apply date filtering based on the period
        if ($period === 'this_week') {
            $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($period === 'this_month') {
            $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
        } elseif ($period === 'this_year') {
            $query->whereBetween('created_at', [now()->startOfYear(), now()->endOfYear()]);
        }

        return $query->get()->sum(function ($history) {
            return round($history->order->delivery_charge_admin, 2) ?? 0; // Sum admin delivery charge
        });
    }
}
