"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
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
      const data = err?.response?.data;
      let msg = data?.message ?? "iyzico onayi gonderilemedi";
      // Escrow stok guard: onaydan once canli stok kontrolu tukenmis urun buldu.
      if (data?.code === "stock_out" && Array.isArray(data?.out_of_stock)) {
        const names = data.out_of_stock
          .map((o: { name?: string | null }) => o?.name)
          .filter(Boolean)
          .join(", ");
        if (names) msg += ` (Tükenmiş: ${names})`;
      }
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* KURAL: iyzico para onayi ne zaman gonderilmeli? (escrow akisi) */}
      <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Para Onayı ne zaman gönderilmeli?</p>
          <p className="mt-1">
            Onay, parayı satıcıya <strong>serbest bırakır ve geri alınamaz</strong>{" "}
            (sonrası sadece yavaş iade; hızlı iptal/void hakkı kalmaz).
          </p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>
              <strong>✓ Tedarikçi ürünü kargoladığını teyit edince</strong> onaylayın.
            </li>
            <li>
              ✗ Çok <strong>erken</strong> (ürün gelmeden) onaylamayın — tükenirse hızlı iptal hakkını kaybedersiniz.
            </li>
            <li>✗ Çok <strong>geç</strong> de bırakmayın — satıcının ödemesi gecikir.</li>
          </ul>
          <p className="mt-1 text-amber-700">
            Sistem, onaydan önce otomatik <strong>canlı stok kontrolü</strong> yapar; ürün tükenmişse onayı engeller.
          </p>
        </div>
      </div>

      <button
        onClick={handleClick}
        disabled={pending}
        title="iyzico'da bu siparis icin Approval gonder — para cekilebilir bakiyeye gecer"
        className="inline-flex w-fit items-center gap-1.5 rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        iyzico Onayı Gönder
      </button>
    </div>
  );
}
