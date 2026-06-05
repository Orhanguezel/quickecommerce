"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

/**
 * iyzico "Onay bazli tahsilat" akISI — admin'in panelden Approval gönderme
 * butonu.
 *
 * POST /api/v1/admin/orders/{id}/approve-payment
 *
 * Görünürlük: payment_gateway==='iyzico' && payment_status==='paid'
 *             && iyzico_approved_at === null
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
        "Bu siparis icin iyzico onay gonderilecek. Onay sonrasi para iyzico cekilebilir bakiyeye gecer. Devam edilsin mi?"
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
        `${base}/v1/admin/orders/${orderMasterId}/approve-payment`,
        {},
        {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      toast.success(res.data?.message ?? "iyzico onayi gonderildi");
      qc.invalidateQueries({ predicate: () => true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "iyzico onayi gonderilemedi";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title="iyzico'da bu siparis icin Approval gonder — para cekilebilir bakiyeye gecer"
      className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}
      iyzico Onayı Gönder
    </button>
  );
}
