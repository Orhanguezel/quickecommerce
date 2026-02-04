<?php

namespace App\Models;

use App\Traits\RoundNumericFields;
use Illuminate\Database\Eloquent\Model;
use Modules\Subscription\app\Models\StoreSubscription;

class Order extends Model
{
    use RoundNumericFields;
    protected $fillable = [
        'order_master_id',
        'store_id',
        'area_id',
        'invoice_number',
        'invoice_date',
        'order_type',
        'delivery_option',
        'delivery_type',
        'delivery_time',
        'order_amount',
        'order_amount_store_value',
        'order_amount_admin_commission',
        'coupon_discount_amount_admin',
        'product_discount_amount',
        'flash_discount_amount_admin',
        'shipping_charge',
        'delivery_charge_admin',
        'delivery_charge_admin_commission',
        'order_additional_charge_name',
        'order_additional_charge_amount',
        'order_additional_charge_store_amount',
        'order_admin_additional_charge_commission',
        'is_reviewed',
        'confirmed_by',
        'confirmed_at',
        'cancel_request_by',
        'cancel_request_at',
        'cancelled_by',
        'cancelled_at',
        'delivery_completed_at',
        'refund_status',
        'payment_status',
        'status',
    ];

    public function orderMaster()
    {
        return $this->belongsTo(OrderMaster::class, 'order_master_id', 'id');
    }

    public function orderAddress()
    {
        return $this->belongsTo(OrderAddress::class, 'order_master_id', 'id');
    }

    // Hook into the status update
    public static function boot()
    {
        parent::boot();

        static::updated(function ($order) {
            // Only proceed if the status was changed to 'delivered' or 'cancelled'
            if (in_array($order->status, ['delivered', 'cancelled'])) {
                $storeSubscription = StoreSubscription::where('store_id', $order->store_id)->first();
                if ($storeSubscription) {
                    // Decrement order limit
                    $storeSubscription->order_limit -= 1;
                    $storeSubscription->save();
                }
            }
        });
    }


    // This function generates invoice when the order is created
    protected static function booted()
    {
        static::creating(function ($order) {
            // 6 chars from date: YYMMDD
            $datePart = now()->format('ymd');
            // 9 chars from unique ID (alphanumeric, base36)
            $uniquePart = strtoupper(substr(base_convert(uniqid(), 16, 36), -9));
            $order->invoice_number = $datePart . $uniquePart; // Total: 15 characters
            $order->invoice_date = now();
        });
    }


    public function orderDetail()
    {
        return $this->hasMany(OrderDetail::class, 'order_id', 'id');
    }

    public function area()
    {
        return $this->belongsTo(StoreArea::class, 'area_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }


    public function orderDeliveryHistory()
    {
        return $this->hasMany(OrderDeliveryHistory::class, 'order_id', 'id');
    }

    public function deliveryman()
    {
        return $this->belongsTo(User::class, 'confirmed_by', 'id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id', 'id');
    }

    public function refund()
    {
        return $this->hasOne(OrderRefund::class, 'order_id', 'id');
    }

    public function orderActivities()
    {
        return $this->hasMany(OrderActivity::class, 'order_id', 'id');
    }

    public function isReviewedByCustomer(int $customerId, int $orderId, int $reviewableId, string $reviewableType): bool
    {
        return Review::where('customer_id', $customerId)
            ->where('order_id', $orderId)
            ->where('reviewable_type', $reviewableType)
            ->where('reviewable_id', $reviewableId)
            ->exists();
    }


}
