<?php

namespace App\Repositories;

use App\Interfaces\AdminDashboardInterface;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductBrand;
use App\Models\ProductCategory;
use App\Models\Slider;
use App\Models\Store;
use App\Models\StoreArea;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\Blog\app\Models\Blog;
use Modules\Subscription\app\Models\SubscriptionHistory;
use Modules\Wallet\app\Models\WalletWithdrawalsTransaction;

class AdminDashboardRepository implements AdminDashboardInterface
{
    public function __construct(protected User $user)
    {

    }

    public function getSummaryData(?int $store_id = null, $filters = [])
    {
        $storeQuery = Store::query();
        $userQuery = User::query();
        $orderQuery = Order::query();

        // Apply filter if provided
        if (!empty($filters['store_type'])) {
            $storeQuery->where('store_type', $filters['store_type']);
            $userQuery->whereHas('stores', function ($q) use ($filters) {
                $q->where('store_type', $filters['store_type']);
            });
            $orderQuery->whereHas('store', function ($q) use ($filters) {
                $q->where('store_type', $filters['store_type']);
            });
        }

        $total_store = $storeQuery->count();
        $total_seller = (clone $userQuery)->where('store_owner', 1)->count();
        $total_staff = (clone $userQuery)
            ->where('activity_scope', 'store_level')
            ->where('store_owner', '!=', 1)
            ->count();

        $total_product = Product::count();
        $total_customer = Customer::count();

        $baseOrderQuery = $orderQuery;
        if ($store_id) {
            $baseOrderQuery->where('store_id', $store_id);
        }

        $total_order = (clone $baseOrderQuery)->count();
        $pending_orders = (clone $baseOrderQuery)->where('status', 'pending')->count();
        $confirmed_orders = (clone $baseOrderQuery)->where('status', 'confirmed')->count();
        $processing_orders = (clone $baseOrderQuery)->where('status', 'processing')->count();
        $shipped_orders = (clone $baseOrderQuery)->where('status', 'shipped')->count();
        $completed_orders = (clone $baseOrderQuery)->where('status', 'delivered')->count();
        $cancelled_orders = (clone $baseOrderQuery)->where('status', 'cancelled')->count();
        $deliveryman_not_assigned_orders = (clone $baseOrderQuery)
            ->where('status', 'processing')
            ->whereNull('confirmed_by')
            ->count();
        $refunded_orders = (clone $baseOrderQuery)->where('refund_status', 'refunded')->count();

        $total_areas = StoreArea::count();
        $total_deliverymen = User::where('activity_scope', 'delivery_level')->count();
        $total_categories = ProductCategory::count();
        $total_brands = ProductBrand::count();
        $total_sliders = Slider::count();
        $total_coupons = Coupon::count();
        $total_pages = Page::count();
        $total_blogs = Blog::count();
        $total_tickets = Ticket::count();

        // Earnings calculation
        $earningsQuery = (clone $baseOrderQuery)->whereHas('orderMaster', function ($q) {
                $q->where('payment_status', 'paid');
            })->whereHas('store', function ($q) {
                $q->where('subscription_type', 'commission');
            })->where(function ($q) {
                $q->where('refund_status', '!=', 'refunded')
                    ->orWhereNull('refund_status')
                    ->where('order_type', '!=', 'pos');
            });
        $total_earnings = $earningsQuery->sum('order_amount');

        $pos_earningsQuery = (clone $baseOrderQuery)->whereHas('orderMaster', function ($q) {
            $q->where('payment_status', 'paid');
        })->wherehas('store', function ($q) {
            $q->where('subscription_type', 'commission');
        })->where(function ($q) {
            $q->where('refund_status', '!=', 'refunded')
                ->orWhereNull('refund_status')->where('order_type', '=', 'pos');
        });

        $total_pos_order_earnings = $pos_earningsQuery->sum('order_amount');

        $total_refunds = (clone $baseOrderQuery)->where('refund_status', 'refunded')->sum('order_amount');

        $total_withdrawals = WalletWithdrawalsTransaction::where('status', 'approved')->sum('amount');

        $total_subscription_earnings = SubscriptionHistory::where('status', 1)
            ->where('payment_status', 'paid')
            ->sum('price');

        $total_tax = OrderDetail::whereHas('order', function ($orderQuery) use ($filters) {
            $orderQuery->where(function ($q) {
                $q->where('refund_status', '!=', 'refunded')
                    ->orWhereNull('refund_status');
            })
                ->whereHas('orderMaster', function ($masterQuery) {
                    $masterQuery->where('payment_status', 'paid');
                });

            if (!empty($filters['store_type'])) {
                $orderQuery->whereHas('store', function ($q) use ($filters) {
                    $q->where('store_type', $filters['store_type']);
                });
            }
        })->sum('total_tax_amount');

        $total_admin_commission_amount = (clone $baseOrderQuery)
            ->whereHas('orderMaster', function ($q) {
                $q->where('payment_status', 'paid');
            })
            ->whereNull('refund_status')
            ->sum('order_amount_admin_commission');

        $delivery_charge_admin_commission = (clone $baseOrderQuery)
            ->whereHas('orderMaster', function ($q) {
                $q->where('payment_status', 'paid');
            })
            ->whereNull('refund_status')
            ->sum('delivery_charge_admin_commission');

        $order_admin_additional_charge_commission = (clone $baseOrderQuery)
            ->whereHas('orderMaster', function ($q) {
                $q->where('payment_status', 'paid');
            })
            ->whereNull('refund_status')
            ->sum('order_admin_additional_charge_commission');



        $total_order_revenue = $total_earnings;

        // total admin revenue calculate
        $total_with_tax_revenue = $total_admin_commission_amount + $delivery_charge_admin_commission + $order_admin_additional_charge_commission + $total_subscription_earnings + $total_tax;
        $total_without_tax_revenue = $total_with_tax_revenue - $total_tax;
        $total_without_tax_and_without_refund_revenue = $total_without_tax_revenue - $total_refunds;
        $total_revenue = $total_without_tax_and_without_refund_revenue;

        return [
            'total_customers' => $total_customer,
            'total_sellers' => $total_seller,
            'total_stores' => $total_store,
            'total_products' => $total_product,
            'total_deliverymen' => $total_deliverymen,
            'total_areas' => $total_areas,
            'total_categories' => $total_categories,
            'total_brands' => $total_brands,
            'total_sliders' => $total_sliders,
            'total_coupons' => $total_coupons,
            'total_pages' => $total_pages,
            'total_blogs' => $total_blogs,
            'total_tickets' => $total_tickets,
            'total_staff' => $total_staff,

            'total_orders' => $total_order,
            'total_pending_orders' => $pending_orders,
            'total_confirmed_orders' => $confirmed_orders,
            'total_processing_orders' => $processing_orders,
            'total_shipped_orders' => $shipped_orders,
            'total_delivered_orders' => $completed_orders,
            'total_cancelled_orders' => $cancelled_orders,
            'deliveryman_not_assigned_orders' => $deliveryman_not_assigned_orders,
            'total_refunded_orders' => $refunded_orders,

            'total_earnings' => $total_earnings,
            'total_order_commission' => $total_admin_commission_amount,
            'total_refunds' => $total_refunds,
            'total_order_revenue' => $total_order_revenue,
            'total_withdrawals' => $total_withdrawals,
            'total_tax' => $total_tax,
            'total_subscription_earnings' => $total_subscription_earnings,
            'total_revenue' => $total_revenue,
            'total_pos_order_earnings' => $total_pos_order_earnings,
        ];
    }


    public function getSummaryDataWithFilters(array $filters): array
    {
        $orderQuery = Order::query();

        if (!empty($filters['store_id'])) {
            $orderQuery->where('store_id', $filters['store_id']);
        }

        if (!empty($filters['order_status'])) {
            $orderQuery->where('status', $filters['order_status']);
        }

        if (!empty($filters['customer_id'])) {
            $orderQuery->whereHas('orderMaster', function ($q) use ($filters) {
                $q->where('customer_id', $filters['customer_id']);
            });
        }

        if (!empty($filters['payment_gateway'])) {
            $orderQuery->whereHas('orderMaster', function ($q) use ($filters) {
                $q->where('payment_gateway', $filters['payment_gateway']);
            });
        }

        if (!empty($filters['payment_status'])) {
            $orderQuery->whereHas('orderMaster', function ($q) use ($filters) {
                $q->where('payment_status', $filters['payment_status']);
            });
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $orderQuery->whereBetween('created_at', [$filters['start_date'], $filters['end_date']]);
        } elseif (!empty($filters['start_date'])) {
            $orderQuery->whereDate('created_at', '>=', $filters['start_date']);
        } elseif (!empty($filters['end_date'])) {
            $orderQuery->whereDate('created_at', '<=', $filters['end_date']);
        }

        if (!empty($filters['type'])) {
            $orderQuery->whereHas('store', function ($q) use ($filters) {
                $q->where('store_type', $filters['type']);
            });
        }

        if (!empty($filters['area_id'])) {
            $orderQuery->where('area_id', $filters['area_id']);
        }

        // Now calculate the rest same as before using the filtered query
        $total_order = $orderQuery->count();
        $pending_orders = (clone $orderQuery)->where('status', 'pending')->count();
        $confirmed_orders = (clone $orderQuery)->where('status', 'confirmed')->count();
        $processing_orders = (clone $orderQuery)->where('status', 'processing')->count();
        $shipped_orders = (clone $orderQuery)->where('status', 'shipped')->count();
        $completed_orders = (clone $orderQuery)->where('status', 'delivered')->count();
        $cancelled_orders = (clone $orderQuery)->where('status', 'cancelled')->count();
        $deliveryman_not_assigned_orders = (clone $orderQuery)->where('status', 'processing')->whereNull('confirmed_by')->count();
        $refunded_orders = (clone $orderQuery)->where('refund_status', 'refunded')->count();

        // earnings, revenue etc
        $total_earnings = (clone $orderQuery)
            ->whereHas('orderMaster', function ($q) {
                $q->where('payment_status', 'paid');
            })
            ->where(function ($q) {
                $q->where('refund_status', '!=', 'refunded')
                    ->orWhereNull('refund_status');
            })->sum('order_amount');

        $total_refunds = (clone $orderQuery)->where('refund_status', 'refunded')->sum('order_amount');

        $total_admin_commission_amount = (clone $orderQuery)
            ->whereHas('orderMaster', function ($q) {
                $q->where('payment_status', 'paid');
            })
            ->whereNull('refund_status')
            ->sum('order_amount_admin_commission');

        $total_order_revenue = $total_earnings - $total_refunds;

        $total_tax = OrderDetail::whereHas('order', function ($q) use ($filters) {
            if (!empty($filters['store_id'])) {
                $q->where('store_id', $filters['store_id']);
            }

            $q->where(function ($subQ) {
                $subQ->where('refund_status', '!=', 'refunded')->orWhereNull('refund_status');
            })->whereHas('orderMaster', function ($masterQ) {
                $masterQ->where('payment_status', 'paid');
            });
        })->sum('total_tax_amount');

        $total_subscription_earnings = SubscriptionHistory::where('status', 1)
            ->where('payment_status', 'paid')
            ->sum('price');

        $total_revenue = ($total_order_revenue + $total_admin_commission_amount + $total_subscription_earnings) - $total_tax;

        // static counts
        $total_store = Store::count();
        $total_seller = User::where('store_owner', 1)->count();
        $total_product = Product::count();
        $total_customer = Customer::count();
        $total_staff = User::where('activity_scope', 'store_level')->where('store_owner', '!=', 1)->count();
        $total_areas = StoreArea::count();
        $total_deliverymen = User::where('activity_scope', 'delivery_level')->count();
        $total_categories = ProductCategory::count();
        $total_brands = ProductBrand::count();
        $total_sliders = Slider::count();
        $total_coupons = Coupon::count();
        $total_pages = Page::count();
        $total_blogs = Blog::count();
        $total_tickets = Ticket::count();
        $total_withdrawals = WalletWithdrawalsTransaction::where('status', 'approved')->sum('amount');

        return [
            'total_customers' => $total_customer,
            'total_sellers' => $total_seller,
            'total_stores' => $total_store,
            'total_products' => $total_product,
            'total_deliverymen' => $total_deliverymen,
            'total_areas' => $total_areas,
            'total_categories' => $total_categories,
            'total_brands' => $total_brands,
            'total_sliders' => $total_sliders,
            'total_coupons' => $total_coupons,
            'total_pages' => $total_pages,
            'total_blogs' => $total_blogs,
            'total_tickets' => $total_tickets,
            'total_staff' => $total_staff,

            'total_orders' => $total_order,
            'total_pending_orders' => $pending_orders,
            'total_confirmed_orders' => $confirmed_orders,
            'total_processing_orders' => $processing_orders,
            'total_shipped_orders' => $shipped_orders,
            'total_delivered_orders' => $completed_orders,
            'total_cancelled_orders' => $cancelled_orders,
            'deliveryman_not_assigned_orders' => $deliveryman_not_assigned_orders,
            'total_refunded_orders' => $refunded_orders,

            'total_earnings' => $total_earnings,
            'total_order_commission' => $total_admin_commission_amount,
            'total_refunds' => $total_refunds,
            'total_order_revenue' => $total_order_revenue,
            'total_withdrawals' => $total_withdrawals,
            'total_tax' => $total_tax,
            'total_subscription_earnings' => $total_subscription_earnings,
            'total_revenue' => $total_revenue,
        ];
    }


    public function getSalesSummaryData(array $filters)
    {
        $query = Order::query();

        if (!empty($filters['this_week'])) {
            $startDate = Carbon::now()->startOfWeek();
            $endDate = Carbon::now()->endOfWeek();
        } elseif (!empty($filters['this_month'])) {
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();
        } elseif (!empty($filters['this_year'])) {
            $startDate = Carbon::now()->startOfYear();
            $endDate = Carbon::now()->endOfYear();
        } elseif (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $startDate = Carbon::parse($filters['start_date'])->startOfDay();
            $endDate = Carbon::parse($filters['end_date'])->endOfDay();
        }

        if (isset($startDate) && isset($endDate)) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        if (!empty($filters['store_type'])) {
            $query->whereHas('store', function ($q) use ($filters) {
                $q->where('store_type', $filters['store_type']);
            });
        }

        return $query
            ->where('status', 'delivered')
            ->selectRaw('DATE(created_at) as date, SUM(order_amount) as total_sales')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getOrderGrowthData(array $filters = [])
    {
        $year = Carbon::now()->year;
        $query = Order::query();
        if (!empty($filters['store_type'])) {
            $query->whereHas('store', function ($q) use ($filters) {
                $q->where('store_type', $filters['store_type']);
            });
        }
        // Fetch order counts per month
        $monthlyData = $query
            ->whereYear('created_at', $year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as total_orders')
            )
            ->pluck('total_orders', 'month');
        // Fill missing months with 0
        return collect(range(1, 12))->mapWithKeys(fn($month) => [$month => $monthlyData->get($month, 0)]);
    }

    public function getOtherSummaryData(array $filters = [])
    {
        $topRatedProducts = $this->getTopRatedProducts($filters);

        $topSellingStores = $this->getTopSellingStores($filters);

        $recentCompletedOrders = $this->getRecentCompletedOrders($filters);

        $topCategories = $this->getTopCategories($filters);

        return [
            'top_rated_products' => $topRatedProducts,
            'top_selling_stores' => $topSellingStores,
            'recent_completed_orders' => $recentCompletedOrders,
            'top_categories' => $topCategories,
        ];
    }

    public function getTopCategories(array $filters = [])
    {
        $productQuery = Product::query()
            ->select('category_id')
            ->whereNotNull('category_id');

        if (!empty($filters['store_type'])) {
            $productQuery->whereHas('store', function ($query) use ($filters) {
                $query->where('type', $filters['store_type']);
            });
        }

        $topCategoryIds = $productQuery
            ->groupBy('category_id')
            ->orderByRaw('SUM(order_count) DESC')
            ->limit(10)
            ->pluck('category_id');

        return ProductCategory::with('translations')
            ->whereIn('id', $topCategoryIds)
            ->get()
            ->sortBy(function ($category) use ($topCategoryIds) {
                return array_search($category->id, $topCategoryIds->toArray());
            })
            ->values();
    }

    public function getTopRatedProducts($filters = [])
    {
        $query = Product::query();
        if (!empty($filters['store_type'])) {
            $query->whereHas('store', function ($q) use ($filters) {
                $q->where('store_type', $filters['store_type']);
            });
        }
        return $query
            ->with(['variants', 'store'])
            ->where('products.status', 'approved')
            ->whereNull('products.deleted_at')
            ->leftJoin('reviews', function ($join) {
                $join->on('products.id', '=', 'reviews.reviewable_id')
                    ->where('reviews.reviewable_type', '=', Product::class)
                    ->where('reviews.status', '=', 'approved');
            })
            ->select([
                'products.id',
                'products.name',
                'products.slug',
                'products.image',
                'products.store_id',
                'products.status',
                DB::raw('COALESCE(AVG(reviews.rating), 0) as avg_rating')
            ])
            ->groupBy([
                'products.id',
                'products.name',
                'products.slug',
                'products.image',
                'products.store_id',
                'products.status'
            ])
            ->orderByDesc('avg_rating')
            ->limit(5)
            ->get();
    }

    public function getTopSellingStores($filters = [])
    {
        $query = Order::query();
        if (!empty($filters['store_type'])) {
            $query->whereHas('store', function ($q) use ($filters) {
                $q->where('store_type', $filters['store_type']);
            });
        }
        return $query
            ->with('store')
            ->where('status', 'delivered')
            ->selectRaw('store_id, SUM(order_amount) as total_sales')
            ->groupBy('store_id')
            ->orderByDesc('total_sales')
            ->limit(5)
            ->get();
    }

    public function getRecentCompletedOrders($filters = [])
    {
        $query = Order::query();
        if (!empty($filters['store_type'])) {
            $query->whereHas('store', function ($q) use ($filters) {
                $q->where('store_type', $filters['store_type']);
            });
        }
        return $query
            ->with(['orderMaster.customer', 'orderDetail', 'orderMaster', 'store', 'deliveryman', 'orderMaster.shippingAddress'])
            ->where('status', 'delivered')
            ->orderByDesc('delivery_completed_at')
            ->limit(5)
            ->get();
    }
}
