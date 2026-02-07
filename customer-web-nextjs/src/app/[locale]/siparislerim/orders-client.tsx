"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { useOrderListQuery, useCancelOrderMutation } from "@/modules/order/order.service";
import type { Order, OrderStatus } from "@/modules/order/order.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Eye,
  X,
} from "lucide-react";

interface Props {
  translations: Record<string, string>;
}

const STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrdersClient({ translations: t }: Props) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const { data, isLoading, isError } = useOrderListQuery({
    page,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  const cancelMutation = useCancelOrderMutation();

  const getStatusLabel = (status: OrderStatus) => {
    const key = `status_${status}` as keyof typeof t;
    return t[key] || status;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "pickup":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-cyan-100 text-cyan-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "on_hold":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancel = (orderId: number) => {
    setCancellingId(orderId);
  };

  const confirmCancel = () => {
    if (!cancellingId) return;
    cancelMutation.mutate(cancellingId, {
      onSettled: () => setCancellingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{t.error}</p>
      </div>
    );
  }

  const orders = data?.orders ?? [];
  const meta = data?.meta;
  const totalPages = meta?.last_page ?? 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.my_orders}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">
        <Package className="mr-2 inline-block h-6 w-6" />
        {t.my_orders}
      </h1>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t.search}
            className="pl-10"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s === "all" ? "" : s);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                (s === "all" && !statusFilter) || statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s === "all" ? t.filter_all : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <p className="mb-6 text-muted-foreground">{t.no_orders}</p>
          <Button asChild>
            <Link href={ROUTES.HOME}>{t.home}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div
              key={order.order_id}
              className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm sm:p-6"
            >
              {/* Header */}
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold">
                      {t.order_number}: #{order.invoice_number}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.order_date}: {order.order_date}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.store}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {t.currency}
                    {Number(order.order_amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.order_details?.length ?? 0} {t.items_count}
                  </p>
                </div>
              </div>

              {/* Product Thumbnails */}
              {order.order_details && order.order_details.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto">
                  {order.order_details.slice(0, 4).map((detail) => (
                    <div
                      key={detail.id}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted"
                    >
                      {detail.product_image_url && (
                        <Image
                          src={detail.product_image_url}
                          alt={detail.product_name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {order.order_details.length > 4 && (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                      +{order.order_details.length - 4}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/siparis/${order.order_id}`}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    {t.view_detail}
                  </Link>
                </Button>
                {order.status !== "cancelled" &&
                  order.status !== "delivered" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancel(order.order_id)}
                      disabled={cancelMutation.isPending}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      {t.cancel_order}
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t.previous}
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            {t.page} {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t.next}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold">{t.cancel_confirm}</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {t.cancel_confirm_message}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingId(null)}
              >
                {t.cancel_no}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                {t.cancel_yes}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
