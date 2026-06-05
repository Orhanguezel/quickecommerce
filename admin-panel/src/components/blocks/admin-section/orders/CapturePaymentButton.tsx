"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CreditCard, Loader2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

/**
 * iyzico PreAuth ile yetkilendirilmiş (authorized) bir sipariş ödemesini
 * tahsil eder (postauth/capture).
 *
 * POST /api/v1/admin/orders/{id}/capture-payment
 */
export default function CapturePaymentButton({
  orderMasterId,
}: {
  orderMasterId: number | undefined;
}) {
  const [pending, setPending] = useState(false);
  const qc = useQueryClient();

  if (!orderMasterId) return null;

  const handleClick = async () => {
    if (
      !confirm(
        "Bu siparişin iyzico'da bloke tutulan tutarı şimdi tahsil edilecek. Onaylıyor musun?"
      )
    )
      return;

    setPending(true);
    try {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      const base =
        process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
        "https://sportoonline.com/api";
      const res = await axios.post(
        `${base}/v1/admin/orders/${orderMasterId}/capture-payment`,
        {},
        {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      toast.success(res.data?.message ?? "Ödeme tahsil edildi");
      qc.invalidateQueries({ predicate: () => true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Tahsilat başarısız";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title="iyzico PreAuth tutarını tahsil et"
      className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CreditCard className="h-3.5 w-3.5" />
      )}
      Ödemeyi Tahsil Et
    </button>
  );
}
