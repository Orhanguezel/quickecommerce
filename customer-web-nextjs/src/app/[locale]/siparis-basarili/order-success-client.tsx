"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { ReviewRewardBanner } from "@/components/product/review-reward-banner";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
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
  const funnelHandledRef = useRef(false);
  const purchaseSentRef = useRef(false);
  const paymentStatus = paymentSummary?.payment_status;

  useEffect(() => {
    if (!numericOrderId || paymentSummary?.payment_status !== "paid") return;
    // Mark recovery only after the backend confirms payment. Merely opening a
    // success-looking URL must not inflate recovered-cart reporting.
    recover.mutate({
      session_id: getCartSessionId() ?? undefined,
      order_master_id: numericOrderId,
    });
  }, [numericOrderId, paymentSummary?.payment_status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cerez izni bu sayfada sonradan verilirse purchase yine gonderilebilsin.
  // Eskiden ilk paid yanitinda ref kilitleniyor, izin gelse de effect bir
  // daha calismiyordu (derin analiz 2026-09-29: 19 paid siparisin 6'si GA4'te).
  const [consentVersion, setConsentVersion] = useState(0);
  useEffect(() => {
    const onConsent = () => setConsentVersion((v) => v + 1);
    window.addEventListener("sportoonline:cookie-consent", onConsent);
    return () => window.removeEventListener("sportoonline:cookie-consent", onConsent);
  }, []);

  useEffect(() => {
    if (
      funnelHandledRef.current ||
      !paymentSummary ||
      paymentSummary.payment_status !== "paid"
    ) {
      return;
    }
    funnelHandledRef.current = true;

    const funnelKey = `sportoonline_funnel_purchase:${paymentSummary.id}`;
    const event = {
      event: "payment_success" as const,
      order_id: paymentSummary.id,
      amount: paymentSummary.value,
      meta: { payment_method: paymentSummary.payment_gateway },
    };
    try {
      if (!localStorage.getItem(funnelKey)) {
        trackFunnelEvent(event);
        localStorage.setItem(funnelKey, "1");
      }
    } catch {
      // Storage-disabled browsers still get one event for this mounted page.
      trackFunnelEvent(event);
    }
  }, [paymentSummary]);

  useEffect(() => {
    if (
      purchaseSentRef.current ||
      !paymentSummary ||
      paymentSummary.payment_status !== "paid" ||
      !analyticsConsentGranted()
    ) {
      return;
    }

    const gaKey = `sportoonline_ga_purchase:${paymentSummary.id}`;
    const sendPurchase = () =>
      trackPurchase(
        String(paymentSummary.id),
        paymentSummary.items.map((item) => ({
          item_id: item.item_id,
          item_name: item.item_name,
          ...(item.item_variant ? { item_variant: item.item_variant } : {}),
          price: item.price,
          quantity: item.quantity,
        })),
        paymentSummary.value,
        paymentSummary.currency,
        paymentSummary.shipping,
        paymentSummary.coupon ?? undefined,
      );

    // Ref yalniz event gercekten gonderildiginde kilitlenir.
    purchaseSentRef.current = true;
    try {
      if (!localStorage.getItem(gaKey)) {
        sendPurchase();
        localStorage.setItem(gaKey, "1");
      }
    } catch {
      sendPurchase();
    }
  }, [paymentSummary, consentVersion]);

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        {paymentStatus === "paid" ? (
          <>
            <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-500" />
            <h1 className="mb-3 text-2xl font-bold">{t.order_success}</h1>
            <p className="mb-4 text-muted-foreground">{t.order_success_message}</p>
          </>
        ) : paymentStatus === "failed" ? (
          <>
            <XCircle className="mx-auto mb-6 h-20 w-20 text-red-500" />
            <h1 className="mb-3 text-2xl font-bold">Ödeme tamamlanamadı</h1>
            <p className="mb-4 text-muted-foreground">
              Kartınızdan çekim görüyorsanız lütfen tekrar ödeme yapmayın; sipariş numaranızla bizimle iletişime geçin.
            </p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-6 h-20 w-20 animate-spin text-amber-500" />
            <h1 className="mb-3 text-2xl font-bold">Ödemeniz doğrulanıyor</h1>
            <p className="mb-4 text-muted-foreground">
              Banka sonucu bekleniyor. Lütfen tekrar ödeme yapmayın; bu sayfa otomatik olarak güncellenecek.
            </p>
          </>
        )}

        {orderId && (
          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">{t.order_number}</p>
            <p className="text-lg font-bold">#{orderId}</p>
          </div>
        )}

        {/* Beklenti kurma: musteri urunu daha eline almadan "gelince
            degerlendir" fikrini aliyor. Kampanya kapaliyken hicbir sey
            basmiyor. */}
        <ReviewRewardBanner variant="compact" className="mb-6 text-left" />

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
