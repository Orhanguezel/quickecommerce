"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useCartRecoverMutation } from "@/modules/cart/abandoned-cart.service";
import { getCartSessionId } from "@/hooks/use-cart-snapshot-sync";
import { usePaymentSummaryQuery } from "@/modules/order/order.service";
import { analyticsConsentGranted, trackPurchase } from "@/lib/gtm";
import { trackFunnelEvent } from "@/lib/funnel-tracker";

interface Props {
  orderId: string;
  translations: {
    order_success: string;
    order_success_message: string;
    order_number: string;
    continue_shopping: string;
    view_orders: string;
    home: string;
  };
}

export function OrderSuccessClient({ orderId, translations: t }: Props) {
  const recover = useCartRecoverMutation();
  const numericOrderId = /^\d+$/.test(orderId) ? Number(orderId) : null;
  const { data: paymentSummary } = usePaymentSummaryQuery(numericOrderId);
  const conversionHandledRef = useRef(false);

  useEffect(() => {
    if (!numericOrderId || paymentSummary?.payment_status !== "paid") return;
    // Mark recovery only after the backend confirms payment. Merely opening a
    // success-looking URL must not inflate recovered-cart reporting.
    recover.mutate({
      session_id: getCartSessionId() ?? undefined,
      order_master_id: numericOrderId,
    });
  }, [numericOrderId, paymentSummary?.payment_status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      conversionHandledRef.current ||
      !paymentSummary ||
      paymentSummary.payment_status !== "paid"
    ) {
      return;
    }
    conversionHandledRef.current = true;

    const funnelKey = `sportoonline_funnel_purchase:${paymentSummary.id}`;
    const gaKey = `sportoonline_ga_purchase:${paymentSummary.id}`;
    const analyticsItems = paymentSummary.items.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      ...(item.item_variant ? { item_variant: item.item_variant } : {}),
      price: item.price,
      quantity: item.quantity,
    }));

    try {
      if (!localStorage.getItem(funnelKey)) {
        trackFunnelEvent({
          event: "payment_success",
          order_id: paymentSummary.id,
          amount: paymentSummary.value,
          meta: { payment_method: paymentSummary.payment_gateway },
        });
        localStorage.setItem(funnelKey, "1");
      }

      if (analyticsConsentGranted() && !localStorage.getItem(gaKey)) {
        trackPurchase(
          String(paymentSummary.id),
          analyticsItems,
          paymentSummary.value,
          paymentSummary.currency,
          paymentSummary.shipping,
          paymentSummary.coupon ?? undefined,
        );
        localStorage.setItem(gaKey, "1");
      }
    } catch {
      // Storage-disabled browsers still get one event for this mounted page.
      trackFunnelEvent({
        event: "payment_success",
        order_id: paymentSummary.id,
        amount: paymentSummary.value,
        meta: { payment_method: paymentSummary.payment_gateway },
      });
      if (analyticsConsentGranted()) {
        trackPurchase(
          String(paymentSummary.id),
          analyticsItems,
          paymentSummary.value,
          paymentSummary.currency,
          paymentSummary.shipping,
          paymentSummary.coupon ?? undefined,
        );
      }
    }
  }, [paymentSummary]);

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-500" />
        <h1 className="mb-3 text-2xl font-bold">{t.order_success}</h1>
        <p className="mb-4 text-muted-foreground">{t.order_success_message}</p>

        {orderId && (
          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">{t.order_number}</p>
            <p className="text-lg font-bold">#{orderId}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={ROUTES.ORDERS}>{t.view_orders}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTES.HOME}>{t.continue_shopping}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
