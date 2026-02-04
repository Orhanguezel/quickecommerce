<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemCommission extends Model
{
    protected $table = 'system_commissions';

    protected $fillable = [
        'subscription_enabled',                 // Enable or disable subscriptions
        'commission_enabled',                   // Enable or disable commission
        'commission_type',                      // 'percentage' or 'flat'
        'commission_amount',                    // Commission value
        'default_order_commission_rate',        // Default commission for orders
        'default_delivery_commission_charge',   // Default commission for deliveries
        'order_shipping_charge',                // Shipping charge for orders
        'order_confirmation_by',                // Manual or automatic confirmation
        'order_include_tax_amount',                          // Include tax in order calculations
        'order_additional_charge_enable_disable',            // Enable or disable additional charge
        'order_additional_charge_name',               // Name of the additional charge
        'order_additional_charge_amount',             // Amount of the additional charge
        'order_additional_charge_commission',             // Amount of the additional charge
    ];

    protected $casts = [
        'subscription_enabled' => 'boolean',
        'commission_enabled' => 'boolean',
        'order_include_tax_amount' => 'boolean',
        'order_additional_charge_enable_disable' => 'boolean',
    ];

    public static function booted()
    {
        static::updated(function (SystemCommission $systemCommission) {
            if ($systemCommission->isDirty(['commission_type', 'commission_amount'])) {
                Store::where('subscription_type', 'commission')->update([
                    'admin_commission_type' => $systemCommission->commission_type,
                    'admin_commission_amount' => $systemCommission->commission_amount ?? $systemCommission->default_order_commission_rate,
                ]);
            }
        });
    }

    public function calculateCommission(float $amount): float
    {
        if (!$this->commission_enabled) {
            return 0;
        }

        return $this->commission_type === 'percentage'
            ? ($this->commission_amount / 100) * $amount
            : $this->commission_amount;
    }

    public function calculateAdditionalCharge(float $amount): float
    {
        if (!$this->order_additional_charge_enable_disable) {
            return 0;
        }

        return $this->order_additional_charge_amount;
    }
}
