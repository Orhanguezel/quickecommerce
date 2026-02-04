<?php

namespace Modules\Chat\app\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Subscription\app\Models\StoreSubscription;


class Chat extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'user_type',
    ];

    // The owner of the chat (customer, deliveryman, admin, store.)
    public function user(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'user_type', 'user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function storeSubscription()
    {
        return $this->hasOne(StoreSubscription::class, 'store_id', 'user_id');
    }

    public function scopeWithActiveStoreSubscription(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->where('user_type', '!=', 'store')
                ->orWhere(function ($q2) {
                    $q2->where('user_type', 'store')
                        ->whereHas('storeSubscription', function ($q3) {
                            $q3->where('payment_status', 'paid')
                                ->where('status', 1);
                        });
                });
        });
    }

    public function scopeWithLiveChatEnabledStoreSubscription(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->where('user_type', '!=', 'store')
                ->orWhere(function ($q2) {
                    $q2->where('user_type', 'store')
                        ->where(function ($q3) {
                            // 1. Stores with paid, active, live chat subscription
                            $q3->whereHas('storeSubscription', function ($q4) {
                                $q4->where('payment_status', 'paid')
                                    ->where('status', 1)
                                    ->where('live_chat', 1)
                                    ->whereHas('store', function ($q5) {
                                        $q5->where('subscription_type', 'subscription');
                                    });
                            })
                                // 2. OR: Store model has subscription_type = 'commission'
                                ->orWhereHasMorph(
                                    'user',
                                    [\App\Models\Store::class],
                                    function ($q6) {
                                        $q6->where('subscription_type', 'commission');
                                    }
                                );
                        });
                });
        });
    }


}
