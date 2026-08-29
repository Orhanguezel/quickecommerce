"use client";

import { useState } from "react";
import {
  Award,
  Check,
  Clock,
  Copy,
  Gift,
  Loader2,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useLoyaltyInfoQuery,
  useLoyaltyRedeemMutation,
  useLoyaltyVouchersQuery,
} from "@/modules/loyalty/loyalty.service";
import type { LoyaltyTransactionType } from "@/modules/loyalty/loyalty.type";

interface Props {
  /** Hesabim sayfasindan gelen ceviri sozlugu. */
  t: Record<string, string>;
  enabled: boolean;
}

const TYPE_LABEL: Record<LoyaltyTransactionType, string> = {
  order: "Sipariş",
  review: "Değerlendirme",
  redeem: "Çeke dönüştürüldü",
  revoke: "İptal/iade",
  expire: "Süresi doldu",
  manual: "Düzenleme",
};

export function LoyaltyTab({ t, enabled }: Props) {
  const [page, setPage] = useState(1);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const { data, isLoading } = useLoyaltyInfoQuery(page, enabled);
  const { data: vouchersData } = useLoyaltyVouchersQuery(enabled);
  const redeem = useLoyaltyRedeemMutation();

  const info = data?.data;
  const rules = info?.rules;
  const balance = info?.balance ?? 0;
  const pending = info?.pending_balance ?? 0;
  const vouchers = vouchersData?.data ?? [];

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("tr-TR") : "";

  // Kazanma orani 1'in altindaysa ("1 TL = 0,01 puan") oran TERS okunur:
  // "her 100 TL'ye 1 puan". Kimse 0,01 puani zihninde canlandiramaz.
  const earnRate = rules?.earn_per_currency ?? 0;
  const spendPerPoint = earnRate > 0 && earnRate < 1 ? Math.round(1 / earnRate) : 0;

  // Puan ile para birebirse cevrim cumlesini hic kurma; "1 puan = 1 TL"
  // demek yeterli ve kafa karistirmaz.
  const oneToOne =
    rules?.redeem_points_per_unit === 1 && rules?.redeem_value === 1;

  // Bakiyenin tamami bozdurulabilir mi?
  const minPoints = rules?.min_redeem_points ?? 2500;
  const canRedeem = Boolean(info?.redeem_enabled) && balance >= minPoints;

  const pointsToValue = (points: number) => {
    if (!rules?.redeem_points_per_unit) return 0;
    return (points / rules.redeem_points_per_unit) * rules.redeem_value;
  };

  const handleRedeem = async () => {
    setError("");
    const points = Number(redeemPoints);

    if (!Number.isFinite(points) || points <= 0) {
      setError("Geçerli bir puan girin.");
      return;
    }
    if (points < minPoints) {
      setError(`En az ${minPoints.toLocaleString("tr-TR")} puan bozdurabilirsiniz.`);
      return;
    }
    if (points > balance) {
      // Bekleyen puan bozdurulamaz; musteri toplami gorup sasirmasin diye
      // ayrimi burada da soyluyoruz.
      setError(
        pending > 0
          ? `Kullanılabilir puanınız: ${balance.toLocaleString("tr-TR")}. ` +
              `${pending.toLocaleString("tr-TR")} puanınız hâlâ beklemede.`
          : `Yetersiz puan. Bakiyeniz: ${balance.toLocaleString("tr-TR")}`,
      );
      return;
    }

    try {
      await redeem.mutateAsync(points);
      setRedeemPoints("");
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Puan bozdurulamadı, lütfen tekrar deneyin.";
      setError(message);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch {
      // Pano erisimi yoksa sessizce gec; kod zaten ekranda yaziyor.
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bakiye */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            Kullanılabilir
          </div>
          <p className="text-2xl font-bold text-primary">
            {balance.toLocaleString("tr-TR")}
          </p>
        </div>
        {/* Bekleyen puan AYRI gosterilir: musteri toplami gorup bozduramayinca
            "puanim kayboldu" diye destek acar. */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-blue-600" />
            Beklemede
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {pending.toLocaleString("tr-TR")}
          </p>
          {pending > 0 && info?.next_available_at && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(info.next_available_at)} tarihinde açılıyor
            </p>
          )}
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Gift className="h-4 w-4 text-green-600" />
            Karşılığı
          </div>
          <p className="text-xl font-bold text-green-600">
            {t.currency}
            {(info?.balance_value ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <TicketPercent className="h-4 w-4 text-orange-600" />
            Çeklerim
          </div>
          <p className="text-xl font-bold text-orange-600">
            {vouchers.filter((v) => !v.is_used && !v.is_expired).length}
          </p>
        </div>
      </div>

      {/* Misafir hesabi uyarisi: puan biriktirebilir ama hesabini
          tamamlamadan takip etmesi/kullanmasi zor. */}
      {info?.is_guest && (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
          <p className="font-semibold">Hesabınızı tamamlayın</p>
          <p className="mt-1 text-muted-foreground">
            Misafir olarak alışveriş yaptınız. Puanlarınızı her cihazdan takip
            edebilmek ve indirim çeklerinizi rahatça kullanabilmek için bir
            şifre belirleyip hesabınızı tamamlayın.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/hesabim?tab=password">Şifre Belirle</Link>
          </Button>
        </div>
      )}

      {/* Nasil kazanilir */}
      {rules && (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Nasıl çalışır?
          </div>
          <ul className="ml-1 space-y-1 text-muted-foreground">
            <li>
              • Siparişiniz <strong>teslim edildiğinde</strong> puan kazanırsınız:{" "}
              {spendPerPoint > 0 ? (
                <>
                  her {t.currency}
                  {spendPerPoint.toLocaleString("tr-TR")} alışverişe{" "}
                  <strong>1 puan</strong>
                </>
              ) : (
                <>
                  her {t.currency}1 alışverişe{" "}
                  <strong>
                    {rules.earn_per_currency.toLocaleString("tr-TR")} puan
                  </strong>
                </>
              )}
              .
            </li>
            <li>
              • Satın aldığınız ürünü değerlendirdiğinizde ek puan kazanırsınız
              (fotoğraflı değerlendirme daha fazla). Puan, verdiğiniz yıldızdan
              bağımsızdır.
            </li>
            {rules.hold_days > 0 && (
              <li>
                • Kazandığınız puanlar <strong>{rules.hold_days} gün</strong>{" "}
                beklemede kalır, iade süreniz dolduktan sonra kullanıma açılır.
              </li>
            )}
            <li>
              •{" "}
              {oneToOne ? (
                <>
                  <strong>
                    1 puan = {t.currency}1
                  </strong>
                  . En az {rules.min_redeem_points.toLocaleString("tr-TR")} puan
                  ({t.currency}
                  {rules.min_redeem_points.toLocaleString("tr-TR")}) biriktirince
                  indirim çekine dönüştürebilirsiniz.
                </>
              ) : (
                <>
                  {rules.redeem_points_per_unit.toLocaleString("tr-TR")} puan ={" "}
                  {t.currency}
                  {rules.redeem_value} indirim çeki. En az{" "}
                  {rules.min_redeem_points.toLocaleString("tr-TR")} puan
                  bozdurabilirsiniz.
                </>
              )}
            </li>
            <li>
              • Çekler {t.currency}
              {rules.voucher_min_order} ve üzeri sepetlerde,{" "}
              {rules.voucher_valid_days} gün boyunca geçerlidir.
            </li>
          </ul>
        </div>
      )}

      {/* Bozdurma */}
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="mb-3 text-lg font-bold">Puanlarımı Kullan</h2>

        {!info?.redeem_enabled ? (
          <p className="text-sm text-muted-foreground">
            Puan kullanımı şu anda kapalı.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="number"
                inputMode="numeric"
                min={minPoints}
                max={balance}
                step={100}
                placeholder={`En az ${minPoints}`}
                value={redeemPoints}
                onChange={(e) => {
                  setRedeemPoints(e.target.value);
                  setError("");
                }}
                className="sm:max-w-[200px]"
              />
              <Button
                onClick={handleRedeem}
                disabled={!canRedeem || redeem.isPending}
                className="shrink-0"
              >
                {redeem.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Gift className="mr-1.5 h-4 w-4" />
                )}
                Çeke Dönüştür
              </Button>
            </div>

            {redeemPoints && Number(redeemPoints) > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {Number(redeemPoints).toLocaleString("tr-TR")} puan ={" "}
                <strong className="text-foreground">
                  {t.currency}
                  {pointsToValue(Number(redeemPoints)).toFixed(2)}
                </strong>{" "}
                indirim çeki
              </p>
            )}

            {!canRedeem && balance < minPoints && (
              <p className="mt-2 text-sm text-muted-foreground">
                Çek oluşturmak için en az{" "}
                {minPoints.toLocaleString("tr-TR")} puana ulaşmanız gerekiyor.{" "}
                {(minPoints - balance).toLocaleString("tr-TR")} puan kaldı.
              </p>
            )}

            {pending > 0 && (
              <p className="mt-2 text-sm text-blue-600">
                {pending.toLocaleString("tr-TR")} puanınız beklemede
                {info?.next_available_at
                  ? `; ${formatDate(info.next_available_at)} tarihinden itibaren`
                  : ""}{" "}
                kullanabileceksiniz.
              </p>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </>
        )}
      </div>

      {/* Cekler */}
      {vouchers.length > 0 && (
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-bold">Çeklerim</h2>
          <div className="space-y-2">
            {vouchers.map((v) => {
              const inactive = v.is_used || v.is_expired;
              return (
                <div
                  key={v.coupon_code}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ${
                    inactive ? "opacity-50" : "border-primary/40 bg-primary/5"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm font-bold">
                        {v.coupon_code}
                      </code>
                      {!inactive && (
                        <button
                          type="button"
                          onClick={() => copyCode(v.coupon_code)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Kodu kopyala"
                        >
                          {copiedCode === v.coupon_code ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.currency}
                      {v.min_order_value} ve üzeri sepetlerde geçerli
                      {v.end_date
                        ? ` • ${new Date(v.end_date).toLocaleDateString("tr-TR")} tarihine kadar`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {t.currency}
                      {v.discount}
                    </p>
                    {v.is_used && (
                      <p className="text-xs text-muted-foreground">Kullanıldı</p>
                    )}
                    {!v.is_used && v.is_expired && (
                      <p className="text-xs text-muted-foreground">Süresi doldu</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hareketler */}
      <div className="rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="mb-3 text-lg font-bold">Puan Geçmişi</h2>

        {!info?.transactions?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Henüz puan hareketiniz yok. İlk siparişiniz teslim edildiğinde puan
            kazanmaya başlarsınız.
          </p>
        ) : (
          <>
            <div className="divide-y">
              {info.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {tx.description || TYPE_LABEL[tx.type] || tx.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("tr-TR")}
                      {tx.is_pending && tx.available_at
                        ? ` • ${formatDate(tx.available_at)} tarihinde kullanıma açılacak`
                        : tx.expires_at
                          ? ` • ${formatDate(tx.expires_at)} tarihinde sona erer`
                          : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-bold ${
                      tx.is_pending
                        ? "text-blue-600"
                        : tx.points > 0
                          ? "text-green-600"
                          : "text-orange-600"
                    }`}
                  >
                    {tx.points > 0 ? "+" : ""}
                    {tx.points.toLocaleString("tr-TR")}
                  </span>
                </div>
              ))}
            </div>

            {(data?.meta?.last_page ?? 1) > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data?.meta?.last_page}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= (data?.meta?.last_page ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
