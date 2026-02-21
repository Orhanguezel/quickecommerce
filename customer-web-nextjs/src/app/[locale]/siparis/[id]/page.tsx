import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderDetailClient } from "./order-detail-client";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const orderT = await getTranslations({ locale, namespace: "order" });

  return {
    title: `${orderT("order_detail")} #${id}`,
    robots: { index: false },
  };
}

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const orderT = await getTranslations({ locale, namespace: "order" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <OrderDetailClient
      orderId={Number(id)}
      translations={{
        order_detail: orderT("order_detail"),
        order_number: orderT("order_number"),
        order_date: orderT("order_date"),
        status: orderT("status"),
        total: orderT("total"),
        cancel_order: orderT("cancel_order"),
        cancel_confirm: orderT("cancel_confirm"),
        cancel_confirm_message: orderT("cancel_confirm_message"),
        cancel_yes: orderT("cancel_yes"),
        cancel_no: orderT("cancel_no"),
        my_orders: orderT("my_orders"),
        items_count: orderT("items_count"),
        order_items: orderT("order_items"),
        order_summary: orderT("order_summary"),
        subtotal: orderT("subtotal"),
        shipping_charge: orderT("shipping_charge"),
        coupon_discount: orderT("coupon_discount"),
        tax: orderT("tax"),
        total_amount: orderT("total_amount"),
        payment_info: orderT("payment_info"),
        payment_method: orderT("payment_method"),
        payment_status: orderT("payment_status"),
        shipping_address: orderT("shipping_address"),
        order_notes: orderT("order_notes"),
        order_tracking: orderT("order_tracking"),
        invoice_number: orderT("invoice_number"),
        store: orderT("store"),
        quantity: orderT("quantity"),
        unit_price: orderT("unit_price"),
        line_total: orderT("line_total"),
        delivery_option: orderT("delivery_option"),
        status_pending: orderT("status_pending"),
        status_confirmed: orderT("status_confirmed"),
        status_processing: orderT("status_processing"),
        status_pickup: orderT("status_pickup"),
        status_shipped: orderT("status_shipped"),
        status_delivered: orderT("status_delivered"),
        status_cancelled: orderT("status_cancelled"),
        status_on_hold: orderT("status_on_hold"),
        payment_pending: orderT("payment_pending"),
        payment_paid: orderT("payment_paid"),
        payment_failed: orderT("payment_failed"),
        home: commonT("home"),
        loading: commonT("loading"),
        error: commonT("error"),
        currency: commonT("currency"),
        back: commonT("back"),
        request_refund: orderT("request_refund"),
        refund_request: orderT("refund_request"),
        refund_reason: orderT("refund_reason"),
        refund_select_reason: orderT("refund_select_reason"),
        refund_note: orderT("refund_note"),
        refund_note_placeholder: orderT("refund_note_placeholder"),
        refund_file: orderT("refund_file"),
        refund_file_optional: orderT("refund_file_optional"),
        refund_submit: orderT("refund_submit"),
        refund_status_requested: orderT("refund_status_requested"),
        refund_status_processing: orderT("refund_status_processing"),
        refund_status_refunded: orderT("refund_status_refunded"),
        refund_status_rejected: orderT("refund_status_rejected"),
        tracking_desc_pending: orderT("tracking_desc_pending"),
        tracking_desc_confirmed: orderT("tracking_desc_confirmed"),
        tracking_desc_processing: orderT("tracking_desc_processing"),
        tracking_desc_pickup: orderT("tracking_desc_pickup"),
        tracking_desc_shipped: orderT("tracking_desc_shipped"),
        tracking_desc_delivered: orderT("tracking_desc_delivered"),
        tracking_desc_cancelled: orderT("tracking_desc_cancelled"),
        tracking_desc_on_hold: orderT("tracking_desc_on_hold"),
        address_number: orderT("address_number"),
      }}
    />
  );
}
