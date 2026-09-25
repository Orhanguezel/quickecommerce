<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Product;
use App\Models\Store;
use App\Services\CommerceReadinessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminCommerceController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $days = max(1, min(365, (int) $request->query('days', 30)));
        $since = now()->subDays($days);
        $products = Product::query()->withoutGlobalScopes()->whereNull('deleted_at');
        $stores = Store::query()->where('status', 1)->whereNull('deleted_at');
        $orders = DB::table('order_masters as om')
            ->where('om.created_at', '>=', $since)
            ->where('om.is_test', false)
            ->whereExists(fn ($q) => $q->selectRaw('1')->from('orders as o')
                ->whereColumn('o.order_master_id', 'om.id')->where('o.order_type', '!=', 'pos'));

        $channels = (clone $orders)
            ->where('om.payment_status', 'paid')
            ->selectRaw("CASE
                WHEN NULLIF(om.utm_source, '') IS NOT NULL THEN LOWER(om.utm_source)
                WHEN om.referrer LIKE '%sportoonline.com%' THEN 'direct'
                WHEN NULLIF(om.referrer, '') IS NOT NULL THEN LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(om.referrer, '/', 3), '//', -1))
                ELSE 'direct'
            END as source")
            ->selectRaw('COUNT(*) as payments')
            ->selectRaw('SUM(om.paid_amount) as revenue')
            ->groupBy('source')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();
        $buyerCounts = (clone $orders)
            ->where('om.payment_status', 'paid')
            ->whereNotNull('om.customer_id')
            ->select('om.customer_id')
            ->selectRaw('COUNT(*) as purchases')
            ->groupBy('om.customer_id');
        $retention = DB::query()->fromSub($buyerCounts, 'buyers')
            ->selectRaw('COUNT(*) as buyers')
            ->selectRaw('SUM(purchases > 1) as repeat_buyers')
            ->first();
        $platformFinancials = DB::table('orders as o')
            ->join('order_masters as om', 'om.id', '=', 'o.order_master_id')
            ->where('om.created_at', '>=', $since)
            ->where('om.is_test', false)
            ->where('om.payment_status', 'paid')
            ->where('o.order_type', '!=', 'pos')
            ->selectRaw('SUM(COALESCE(o.order_amount_admin_commission, 0)) as product_commission')
            ->selectRaw('SUM(COALESCE(o.delivery_charge_admin_commission, 0)) as shipping_commission')
            ->selectRaw('SUM(COALESCE(o.order_admin_additional_charge_commission, 0)) as additional_commission')
            ->selectRaw('SUM(COALESCE(o.coupon_discount_amount_admin, 0) + COALESCE(o.flash_discount_amount_admin, 0)) as admin_funded_discount')
            ->first();
        $grossPlatformRevenue = (float) ($platformFinancials->product_commission ?? 0)
            + (float) ($platformFinancials->shipping_commission ?? 0)
            + (float) ($platformFinancials->additional_commission ?? 0);
        $netPlatformContribution = $grossPlatformRevenue - (float) ($platformFinancials->admin_funded_discount ?? 0);
        $paidRevenue = (float) (clone $orders)->where('payment_status', 'paid')->sum('paid_amount');

        $qualityQueue = (clone $products)
            ->with('store:id,name')
            ->where(fn ($query) => $query->where('catalog_quality_score', '<', 80)->orWhere('ads_eligible', false))
            ->orderByDesc('is_hero')
            ->orderBy('catalog_quality_score')
            ->limit(20)
            ->get(['id', 'name', 'store_id', 'is_hero', 'catalog_quality_score', 'ads_ineligibility_reason', 'price_index']);
        $storeQueue = (clone $stores)
            ->where(fn ($query) => $query->where('profile_completion_score', '<', 80)
                ->orWhereNull('geliver_sender_address_id')->orWhere('geliver_sender_address_id', ''))
            ->orderBy('profile_completion_score')
            ->limit(20)
            ->get(['id', 'name', 'profile_completion_score', 'geliver_sender_address_id']);
        $customerPurchases = DB::table('order_masters as om')
            ->where('om.is_test', false)
            ->where('om.payment_status', 'paid')
            ->whereNotNull('om.customer_id')
            ->whereExists(fn ($query) => $query->selectRaw('1')->from('orders as online_order')
                ->whereColumn('online_order.order_master_id', 'om.id')->where('online_order.order_type', '!=', 'pos'))
            ->orderBy('om.created_at')
            ->get(['om.customer_id', 'om.created_at'])
            ->groupBy('customer_id');
        $cohorts = collect([30, 60, 90])->map(function (int $horizon) use ($customerPurchases) {
            $eligible = 0;
            $repeated = 0;
            foreach ($customerPurchases as $purchases) {
                $dates = $purchases->pluck('created_at')->map(fn ($date) => \Illuminate\Support\Carbon::parse($date));
                $first = $dates->first();
                if (! $first || $first->lt(now()->subDays(365)) || $first->gt(now()->subDays($horizon))) continue;
                $eligible++;
                if ($dates->skip(1)->contains(fn ($date) => $date->lte($first->copy()->addDays($horizon)))) $repeated++;
            }
            return [
                'days' => $horizon,
                'eligible_buyers' => $eligible,
                'repeat_buyers' => $repeated,
                'repeat_rate_pct' => $eligible > 0 ? round(($repeated / $eligible) * 100, 2) : 0,
            ];
        });

        return response()->json(['status' => true, 'data' => [
            'window_days' => $days,
            'catalog' => [
                'total' => (clone $products)->count(),
                'hero' => (clone $products)->where('is_hero', true)->count(),
                'homepage_featured' => (clone $products)->whereNotNull('homepage_featured_rank')->count(),
                'ads_eligible' => (clone $products)->where('ads_eligible', true)->count(),
                'missing_brand' => (clone $products)->whereNull('brand_id')->count(),
                'missing_category' => (clone $products)->whereNull('category_id')->count(),
                'missing_meta_title' => (clone $products)->where(fn ($q) => $q->whereNull('meta_title')->orWhere('meta_title', ''))->count(),
                'quality_below_80' => (clone $products)->where('catalog_quality_score', '<', 80)->count(),
                'overpriced' => (clone $products)->where('price_index', '>', 1.15)->count(),
                'stale_market_price' => (clone $products)->where(fn ($q) => $q
                    ->whereNull('market_price_checked_at')
                    ->orWhere('market_price_checked_at', '<', now()->subHours(48)))->count(),
            ],
            'stores' => [
                'active' => (clone $stores)->count(),
                'profile_below_80' => (clone $stores)->where('profile_completion_score', '<', 80)->count(),
                'missing_geliver_sender' => (clone $stores)->where(fn ($q) => $q
                    ->whereNull('geliver_sender_address_id')->orWhere('geliver_sender_address_id', ''))->count(),
                'suspended' => (clone $stores)->whereNotNull('sales_suspended_at')->count(),
            ],
            'sales' => [
                'orders' => (clone $orders)->count(),
                'payments' => (clone $orders)->where('payment_status', 'paid')->count(),
                'revenue' => $paidRevenue,
                'platform_commission' => $grossPlatformRevenue,
                'admin_funded_discount' => (float) ($platformFinancials->admin_funded_discount ?? 0),
                'net_platform_contribution' => $netPlatformContribution,
                'net_platform_margin_pct' => $paidRevenue > 0 ? round(($netPlatformContribution / $paidRevenue) * 100, 2) : 0,
                'cancelled_or_refunded' => (clone $orders)->whereIn('payment_status', ['cancelled', 'refunded'])->count(),
                'buyers' => (int) ($retention->buyers ?? 0),
                'repeat_buyers' => (int) ($retention->repeat_buyers ?? 0),
                'repeat_buyer_rate_pct' => (int) ($retention->buyers ?? 0) > 0
                    ? round(((int) $retention->repeat_buyers / (int) $retention->buyers) * 100, 2)
                    : 0,
            ],
            'shipping' => [
                'due' => DB::table('orders')->where('created_at', '>=', $since)->where('order_type', '!=', 'pos')
                    ->whereNotNull('promised_ship_at')->count(),
                'on_time' => DB::table('orders')->where('created_at', '>=', $since)->where('order_type', '!=', 'pos')->whereNotNull('shipped_at')
                    ->whereColumn('shipped_at', '<=', 'promised_ship_at')->count(),
                'breached' => DB::table('orders')->where('created_at', '>=', $since)->where('order_type', '!=', 'pos')
                    ->whereNotNull('sla_breached_at')->count(),
            ],
            'channels' => $channels,
            'quality_queue' => $qualityQueue,
            'store_queue' => $storeQueue,
            'cohorts' => $cohorts,
        ]]);
    }

    public function reviewProduct(Request $request, Product $product, CommerceReadinessService $service): JsonResponse
    {
        $validated = $request->validate([
            'is_hero' => 'sometimes|boolean',
            'homepage_featured_rank' => [
                'sometimes', 'nullable', 'integer', 'min:1', 'max:100',
                Rule::unique('products', 'homepage_featured_rank')->ignore($product->id),
            ],
            'market_min_price' => 'sometimes|required|numeric|min:0.01',
        ]);

        if (array_key_exists('is_hero', $validated)) {
            $product->is_hero = $validated['is_hero'];
        }
        if (array_key_exists('homepage_featured_rank', $validated)) {
            $product->homepage_featured_rank = $validated['homepage_featured_rank'];
            if ($validated['homepage_featured_rank'] !== null) {
                $product->is_featured = true;
            }
        }
        if (array_key_exists('market_min_price', $validated)) {
            $product->market_min_price = $validated['market_min_price'];
            $product->market_price_checked_at = now();
        }
        $product->commercial_reviewed_at = now();
        $product->save();

        return response()->json([
            'status' => true,
            'data' => $service->refreshProduct($product->fresh(['variants', 'store'])),
        ]);
    }

    public function reviewStore(Request $request, Store $store, CommerceReadinessService $service): JsonResponse
    {
        $validated = $request->validate([
            'shipping_sla_hours' => 'sometimes|integer|min:1|max:336',
            'sales_suspended' => 'sometimes|boolean',
            'sales_suspension_reason' => 'nullable|string|max:255',
        ]);

        if (array_key_exists('shipping_sla_hours', $validated)) {
            $store->shipping_sla_hours = $validated['shipping_sla_hours'];
        }
        if (array_key_exists('sales_suspended', $validated)) {
            $store->sales_suspended_at = $validated['sales_suspended'] ? now() : null;
            $store->sales_suspension_reason = $validated['sales_suspended']
                ? ($validated['sales_suspension_reason'] ?? 'manual_admin_review')
                : null;
        }
        $store->save();

        return response()->json([
            'status' => true,
            'data' => $service->refreshStore($store->fresh()),
        ]);
    }
}
