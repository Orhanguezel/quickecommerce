<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Exports\OrderReportExport;
use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Admin\AdminOrderDashboardReportResource;
use App\Http\Resources\Admin\AdminOrderReportResource;
use App\Http\Resources\Admin\AdminSubscriptionTransactionDashboardReport;
use App\Http\Resources\Admin\AdminSubscriptionTransactionReport;
use App\Http\Resources\Admin\AdminTransactionDashboardReportResource;
use App\Http\Resources\Admin\AdminTransactionReportResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Interfaces\AdminDashboardInterface;
use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Modules\Subscription\app\Models\SubscriptionHistory;

class AdminReportAnalyticsManageController extends Controller
{
    public function __construct(protected AdminDashboardInterface $adminRepo)
    {

    }

    public function reportList(Request $request)
    {
        $reports = [
            'transaction_report' => 'Transaction Report Data',
            'item_report' => 'Item Report Data',
            'store_wise_report' => 'Store Wise Report Data',
            'expense_report' => 'Expense Report Data',
            'disbursement_report' => 'Disbursement Report Data',
            'order_report' => 'Order Report Data',
        ];

        // Optional: Filter by report type if specified in the request
        $reportType = $request->get('type');
        if ($reportType && isset($reports[$reportType])) {
            return response()->json([
                'message' => ucfirst(str_replace('_', ' ', $reportType)),
                'data' => $reports[$reportType],
            ]);
        }
        // Default: Return all reports
        return response()->json([
            'message' => 'Admin Report Analytics Index',
            'reports' => array_keys($reports),
        ]);
    }

    public function orderReport(Request $request)
    {
        $filters = [
            'type' => $request->type,
            'area_id' => $request->area_id,
            'payment_gateway' => $request->payment_gateway,
            'payment_status' => $request->payment_status,
            'order_status' => $request->order_status,
            'store_id' => $request->store_id,
            'customer_id' => $request->customer_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'search' => $request->search,
            'per_page' => $request->per_page
        ];

        $query = OrderDetail::query();
        $store_id = null;

        if (isset($filters['search'])) {
            $query->whereHas('order', function ($q) use ($filters) {
                $q->where('id', 'LIKE', '%' . $filters['search'] . '%')
                    ->orWhere('invoice_number', 'LIKE', '%' . $filters['search'] . '%');
            });
        }

        if (isset($filters['type'])) {
            $query->whereHas('store', function ($q) use ($filters) {
                $q->where('store_type', $filters['type']);
            });
        }

        if (isset($filters['area_id'])) {
            $query->where('area_id', $filters['area_id']);
        }

        if (isset($filters['payment_gateway'])) {
            $query->whereHas('order.orderMaster', function ($q) use ($filters) {
                $q->where('payment_gateway', $filters['payment_gateway']);
            });
        }

        if (isset($filters['payment_status'])) {
            $query->whereHas('order.orderMaster', function ($q) use ($filters) {
                $q->where('payment_status', $filters['payment_status']);
            });
        }

        if (isset($filters['order_status'])) {
            $query->whereHas('order', function ($q) use ($filters) {
                $q->where('status', $filters['order_status']);
            });
        }

        if (isset($filters['store_id'])) {
            $query->where('store_id', $filters['store_id']);
            $store_id = $request->store_id;
        }

        if (isset($filters['customer_id'])) {
            $query->whereHas('order.orderMaster', function ($q) use ($filters) {
                $q->where('customer_id', $filters['customer_id']);
            });
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereHas('order', function ($q) use ($filters) {
                $q->whereBetween('created_at', [$filters['start_date'], $filters['end_date']]);
            });
        } elseif (isset($filters['start_date'])) {
            $query->whereHas('order', function ($q) use ($filters) {
                $q->whereDate('created_at', '>=', $filters['start_date']);
            });
        } elseif (isset($filters['end_date'])) {
            $query->whereHas('order', function ($q) use ($filters) {
                $q->whereDate('created_at', '<=', $filters['end_date']);
            });
        }
        $orderDetails = $query->with(['order.orderMaster.customer', 'order.orderMaster', 'store', 'area'])
            ->latest()
            ->paginate($filters['per_page'] ?? 20);

        $dashboard = $this->adminRepo->getSummaryDataWithFilters($filters);
        // Check if export option is requested (either csv or xlsx)
        if ($request->has('export') && in_array($request->export, ['csv', 'xlsx'])) {
            // Export to CSV or XLSX using the filtered data
            return Excel::download(new OrderReportExport($orderDetails), 'order_report_' . time() . '.' . $request->export);
        }

        return response()->json([
            'dashboard' => new AdminOrderDashboardReportResource((object)$dashboard),
            'data' => AdminOrderReportResource::collection($orderDetails),
            'meta' => new PaginationResource($orderDetails)
        ]);
    }

    public function transactionReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'transaction_type' => 'required|in:order,subscription',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $filters = [
            'type' => $request->type,
            'area_id' => $request->area_id,
            'customer_id' => $request->customer_id,
            'payment_gateway' => $request->payment_gateway,
            'payment_status' => $request->payment_status,
            'order_status' => $request->order_status,
            'store_id' => $request->store_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'search' => $request->search,
            'per_page' => $request->per_page
        ];
        if ($request->transaction_type === 'order') {
            $query = Order::with(['orderMaster.customer', 'orderDetail', 'store', 'area']);

            if (isset($filters['search'])) {
                $query->where('id', 'LIKE', '%' . $filters['search'] . '%')
                    ->orWhere('invoice_number', 'LIKE', '%' . $filters['search'] . '%');
            }

            if (isset($filters['type'])) {
                $query->whereHas('store', function ($q) use ($filters) {
                    $q->where('store_type', $filters['type']);
                });
            }

            if (isset($filters['area_id'])) {
                $query->where('area_id', $filters['area_id']);
            }

            if (isset($filters['payment_gateway'])) {
                $query->whereHas('orderMaster', function ($q) use ($filters) {
                    $q->where('payment_gateway', $filters['payment_gateway']);
                });
            }

            if (isset($filters['payment_status'])) {
                $query->where('payment_status', $filters['payment_status']);
            }

            if (isset($filters['order_status'])) {
                $query->where('status', $filters['order_status']);
            }

            if (isset($filters['store_id'])) {
                $query->where('store_id', $filters['store_id']);
            }

            if (isset($filters['customer_id'])) {
                $query->whereHas('orderMaster', function ($q) use ($filters) {
                    $q->where('customer_id', $filters['customer_id']);
                });
            }

            if (isset($filters['start_date']) && isset($filters['end_date'])) {
                $query->whereBetween('created_at', [$filters['start_date'], $filters['end_date']]);
            } elseif (isset($filters['start_date'])) {
                $query->whereDate('created_at', '>=', $filters['start_date']);
            } elseif (isset($filters['end_date'])) {
                $query->whereDate('created_at', '<=', $filters['end_date']);
            }

            $filteredQuery = (clone $query); // Clone for the dashboard summary
            $totalsQuery = (clone $query); // Clone for column totals
            $orderDetails = $query
                ->latest()
                ->paginate($filters['per_page'] ?? 20);
            // Check if export option is requested (either csv or xlsx)
            if ($request->has('export') && in_array($request->export, ['csv', 'xlsx'])) {
                // Export to CSV or XLSX using the filtered data
                return Excel::download(new OrderReportExport($orderDetails), 'order_report_' . time() . '.' . $request->export);
            }

            // Calculate column totals from all filtered data (not just current page)
            $totalsData = $totalsQuery->get();
            $totals = [
                'order_amount' => round($totalsData->sum('order_amount'), 2),
                'coupon_discount_amount_admin' => round($totalsData->sum(function ($order) {
                    return $order->orderDetail?->sum('coupon_discount_amount') ?? 0;
                }), 2),
                'product_discount_amount' => round($totalsData->sum('product_discount_amount'), 2),
                'flash_discount_amount_admin' => round($totalsData->sum('flash_discount_amount_admin'), 2),
                'shipping_charge' => round($totalsData->sum('shipping_charge'), 2),
                'delivery_charge_admin' => round($totalsData->sum('delivery_charge_admin'), 2),
                'delivery_charge_admin_commission' => round($totalsData->sum('delivery_charge_admin_commission'), 2),
                'total_tax_amount' => round($totalsData->sum(function ($order) {
                    return $order->orderDetail?->sum('total_tax_amount') ?? 0;
                }), 2),
                'total_product_amount' => round($totalsData->sum(function ($order) {
                    return ($order->orderDetail?->sum('line_total_price_with_qty') ?? 0) + ($order->orderDetail?->sum('admin_discount_amount') ?? 0);
                }), 2),
                'additional_charge_amount' => round($totalsData->sum('order_additional_charge_amount'), 2),
            ];

            return response()->json([
                'dashboard' => new AdminTransactionDashboardReportResource($filteredQuery),
                'data' => AdminTransactionReportResource::collection($orderDetails),
                'meta' => new PaginationResource($orderDetails),
                'totals' => $totals,
            ]);
        } elseif ($request->transaction_type === 'subscription') {
            $query = SubscriptionHistory::with(['store']);
            if (isset($filters['type'])) {
                $query->whereHas('store', function ($q) use ($filters) {
                    $q->where('store_type', $filters['type']);
                });
            }
            if (isset($filters['search'])) {
                $query->whereHas('store', function ($q) use ($filters) {
                    $q->where('name', 'LIKE', '%' . $filters['search'] . '%');
                });
            }
            if (isset($filters['payment_gateway'])) {
                $query->where('payment_gateway', $filters['payment_gateway']);
            }

            if (isset($filters['payment_status'])) {
                $query->where('payment_status', $filters['payment_status']);
            }

            if (isset($filters['store_id'])) {
                $query->where('store_id', $filters['store_id']);
            }

            if (isset($filters['start_date']) && isset($filters['end_date'])) {
                $query->whereBetween('created_at', [$filters['start_date'], $filters['end_date']]);
            } elseif (isset($filters['start_date'])) {
                $query->whereDate('created_at', '>=', $filters['start_date']);
            } elseif (isset($filters['end_date'])) {
                $query->whereDate('created_at', '<=', $filters['end_date']);
            }
            $totalsQuery = (clone $query); // Clone for column totals
            $subscriptionHistory = $query->latest()->paginate($filters['per_page'] ?? 20);
            $filteredQuery = (clone $query); // Clone for the dashboard summary

            $subscriptionTotals = [
                'price' => round($totalsQuery->sum('price'), 2),
            ];

            return response()->json([
                'dashboard' => new AdminSubscriptionTransactionDashboardReport($filteredQuery),
                'data' => AdminSubscriptionTransactionReport::collection($subscriptionHistory),
                'meta' => new PaginationResource($subscriptionHistory),
                'totals' => $subscriptionTotals,
            ]);
        }
    }

}
