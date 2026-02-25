"use client";

import { useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import {
  useOrderDetailQuery,
  useCancelOrderMutation,
  useRefundReasonsQuery,
  useSubmitRefundMutation,
} from "@/modules/order/order.service";
import type { OrderStatus } from "@/modules/order/order.type";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  FileText,
  Loader2,
  X,
  CheckCircle,
  Circle,
  Clock,
  RotateCcw,
} from "lucide-react";

interface Props {
  orderId: number;
  translations: Record<string, string>;
}

export function OrderDetailClient({ orderId, translations: t }: Props) {
  const { data, isLoading, isError } = useOrderDetailQuery(orderId);
  const cancelMutation = useCancelOrderMutation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Refund state
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundReasonId, setRefundReasonId] = useState<string>("");
  const [refundNote, setRefundNote] = useState("");
  const refundFileRef = useRef<HTMLInputElement>(null);
  const { data: refundReasons } = useRefundReasonsQuery();
  const submitRefundMutation = useSubmitRefundMutation();

  const handleRefundSubmit = () => {
    if (!refundReasonId) return;
    const formData = new FormData();
    formData.append("order_id", String(orderId));
    formData.append("order_refund_reason_id", refundReasonId);
    if (refundNote.trim()) formData.append("customer_note", refundNote);
    const file = refundFileRef.current?.files?.[0];
    if (file) formData.append("file", file);
    submitRefundMutation.mutate(formData, {
      onSuccess: () => {
        setShowRefundDialog(false);
        setRefundReasonId("");
        setRefundNote("");
        if (refundFileRef.current) refundFileRef.current.value = "";
      },
    });
  };

  const getStatusLabel = (status: string) => {
    const key = `status_${status}`;
    return t[key] || status;
  };

  const getTrackingDescription = (status: string, fallback?: string) => {
    const key = `tracking_desc_${status}`;
    return t[key] || fallback || "";
  };

  const getPaymentStatusLabel = (status: string) => {
    const key = `payment_${status}`;
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancel = () => {
    cancelMutation.mutate(orderId, {
      onSettled: () => setShowCancelDialog(false),
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{t.error}</p>
      </div>
    );
  }

  const order = data.order_data;
  const summary = data.order_summary;
  const tracking = data.order_tracking ?? [];
  const master = order.order_master;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <Link href={ROUTES.ORDERS} className="hover:text-foreground">
          {t.my_orders}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">#{order.invoice_number}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={ROUTES.ORDERS}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">
              {t.order_detail} #{order.invoice_number}
            </h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
            >
              {getStatusLabel(order.status)}
            </span>
            <span className="text-sm text-muted-foreground">
              {t.order_date}: {order.order_date}
            </span>
            <span className="text-sm text-muted-foreground">
              {order.store}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              {t.cancel_order}
            </Button>
          )}
          {order.status === "delivered" && !order.refund_status && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRefundDialog(true)}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {t.request_refund}
            </Button>
          )}
          {order.refund_status && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              order.refund_status === "refunded"
                ? "bg-blue-100 text-blue-800"
                : order.refund_status === "rejected"
                ? "bg-red-100 text-red-800"
                : order.refund_status === "processing"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {t[`refund_status_${order.refund_status}`] || order.refund_status}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Tracking */}
          {tracking.length > 0 && (
            <section className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Clock className="h-5 w-5" />
                {t.order_tracking}
              </h2>
              <div className="space-y-0">
                {tracking.map((step, idx) => {
                  const isCompleted = step.timestamp != null;
                  const isCurrent = step.is_current;
                  const stepLabel = getStatusLabel(step.status);
                  const stepDescription = getTrackingDescription(
                    step.status,
                    step.description
                  );
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                        ) : isCurrent ? (
                          <div className="h-5 w-5 shrink-0 rounded-full border-2 border-primary bg-primary/20" />
                        ) : (
                          <Circle className="h-5 w-5 shrink-0 text-muted-foreground/30" />
                        )}
                        {idx < tracking.length - 1 && (
                          <div
                            className={`my-1 h-8 w-0.5 ${
                              isCompleted
                                ? "bg-green-600"
                                : "bg-muted-foreground/20"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-medium ${
                            isCompleted || isCurrent
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {stepLabel}
                        </p>
                        {stepDescription && (
                          <p className="text-sm text-muted-foreground">
                            {stepDescription}
                          </p>
                        )}
                        {step.timestamp && (
                          <p className="text-xs text-muted-foreground">
                            {step.timestamp}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Order Items */}
          <section className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Package className="h-5 w-5" />
              {t.order_items} ({order.order_details?.length ?? 0})
            </h2>

            <div className="divide-y">
              {order.order_details?.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product_image_url && (
                      <Image
                        src={item.product_image_url}
                        alt={item.product_name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_details && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.variant_details)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {t.unit_price}: {t.currency}
                        {Number(item.price).toFixed(2)}
                      </span>
                      <span>
                        {t.quantity}: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {t.currency}
                      {Number(item.line_total_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <section className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <FileText className="h-5 w-5" />
              {t.order_summary}
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.subtotal}</span>
                <span>
                  {t.currency}
                  {Number(summary.subtotal).toFixed(2)}
                </span>
              </div>
              {summary.shipping_charge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t.shipping_charge}
                  </span>
                  <span>
                    {t.currency}
                    {Number(summary.shipping_charge).toFixed(2)}
                  </span>
                </div>
              )}
              {summary.coupon_discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t.coupon_discount}</span>
                  <span>
                    -{t.currency}
                    {Number(summary.coupon_discount).toFixed(2)}
                  </span>
                </div>
              )}
              {!summary.tax_included_in_price && summary.total_tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.tax}</span>
                  <span>
                    {t.currency}
                    {Number(summary.total_tax_amount).toFixed(2)}
                  </span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>{t.total_amount}</span>
                <span>
                  {t.currency}
                  {Number(summary.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          {/* Payment Info */}
          <section className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <CreditCard className="h-5 w-5" />
              {t.payment_info}
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.payment_method}
                </span>
                <span className="capitalize">
                  {master?.payment_gateway?.replace(/_/g, " ") || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.payment_status}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentStatusColor(master?.payment_status ?? "pending")}`}
                >
                  {getPaymentStatusLabel(master?.payment_status ?? "pending")}
                </span>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          {master?.shipping_address && (
            <section className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5" />
                {t.shipping_address}
              </h2>

              <div className="space-y-1 text-sm">
                {master.shipping_address.address && (
                  <p>{master.shipping_address.address}</p>
                )}
                {master.shipping_address.road && (
                  <p className="text-muted-foreground">
                    {master.shipping_address.road}
                    {master.shipping_address.house &&
                      `, ${t.address_number}: ${master.shipping_address.house}`}
                    {master.shipping_address.floor &&
                      `, ${master.shipping_address.floor}`}
                  </p>
                )}
                {master.shipping_address.postal_code && (
                  <p className="text-muted-foreground">
                    {master.shipping_address.postal_code}
                  </p>
                )}
                {master.shipping_address.contact && (
                  <p className="text-muted-foreground">
                    {master.shipping_address.contact}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Order Notes */}
          {master?.order_notes && (
            <section className="rounded-lg border bg-card p-6">
              <h2 className="mb-2 text-sm font-bold">{t.order_notes}</h2>
              <p className="text-sm text-muted-foreground">
                {master.order_notes}
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Refund Request Dialog */}
      {showRefundDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">{t.refund_request}</h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                {t.refund_reason} <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={refundReasonId}
                onChange={(e) => setRefundReasonId(e.target.value)}
              >
                <option value="">{t.refund_select_reason}</option>
                {(refundReasons ?? []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                {t.refund_note}
              </label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                placeholder={t.refund_note_placeholder}
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium">
                {t.refund_file} <span className="text-xs text-muted-foreground">({t.refund_file_optional})</span>
              </label>
              <input
                ref={refundFileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.zip"
                className="w-full text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRefundDialog(false);
                  setRefundReasonId("");
                  setRefundNote("");
                }}
              >
                {t.cancel_no}
              </Button>
              <Button
                size="sm"
                disabled={!refundReasonId || submitRefundMutation.isPending}
                onClick={handleRefundSubmit}
              >
                {submitRefundMutation.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                {t.refund_submit}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
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
                onClick={() => setShowCancelDialog(false)}
              >
                {t.cancel_no}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
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
