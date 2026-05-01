"use client";

import { useState } from "react";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import {
  useSellerApplicationApprove,
  useSellerApplicationReject,
} from "@/modules/admin-section/seller/seller-application.action";
import { Building2, CreditCard, MapPin, ShieldCheck, ShieldAlert, ShieldQuestion, Copy, Check } from "lucide-react";
import ApplicationRejectModal from "./modal/ApplicationRejectModal";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";

type Seller = {
  id?: number | string;
  application_id?: number | string | null;
  kyc_status?: 0 | 1 | 2 | null;
  kyc_admin_note?: string | null;
  kyc_reviewed_at?: string | null;
  consent_at?: string | null;
  company_name?: string | null;
  brand_name?: string | null;
  sector?: string | null;
  tax_office?: string | null;
  tax_number?: string | null;
  mersis_number?: string | null;
  website_url?: string | null;
  address_country?: string | null;
  address_city?: string | null;
  address_district?: string | null;
  address_postal_code?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  bank_name?: string | null;
  bank_account_holder?: string | null;
  bank_iban?: string | null;
  bank_account_number?: string | null;
  bank_branch_code?: string | null;
  bank_swift_code?: string | null;
  iyzico_sub_merchant_key?: string | null;
  iyzico_registered_at?: string | null;
};

interface Props {
  seller: Seller;
}

export default function SellerKycPanel({ seller }: Props) {
  const dispatch = useAppDispatch();
  const { mutate: approve, isPending: isApproving } = useSellerApplicationApprove();
  const { mutate: reject, isPending: isRejecting } = useSellerApplicationReject();
  const [copied, setCopied] = useState(false);

  if (!seller?.application_id) {
    return (
      <Card className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-4 flex items-center gap-3">
          <ShieldQuestion className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="text-sm">
            <strong>KYC bilgisi yok.</strong> Bu satıcı için bir başvuru kaydı bulunamadı (eski hesap ya da admin tarafından doğrudan oluşturulmuş olabilir).
          </div>
        </CardContent>
      </Card>
    );
  }

  const onApprove = () => {
    if (!seller.application_id) return;
    approve(
      { id: String(seller.application_id) },
      { onSuccess: () => dispatch(setRefetch(true)) },
    );
  };

  const onReject = (note: string) => {
    if (!seller.application_id) return;
    reject(
      { id: String(seller.application_id), admin_note: note },
      { onSuccess: () => dispatch(setRefetch(true)) },
    );
  };

  const copyMerchantKey = () => {
    if (!seller.iyzico_sub_merchant_key) return;
    navigator.clipboard.writeText(seller.iyzico_sub_merchant_key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const StatusBadge = () => {
    const s = seller.kyc_status ?? 0;
    if (s === 1) {
      return (
        <Badge className="bg-green-50 border border-green-500 text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <ShieldCheck className="h-3 w-3 mr-1" /> Onaylandı
        </Badge>
      );
    }
    if (s === 2) {
      return (
        <Badge className="bg-red-50 border border-red-500 text-red-700 dark:bg-red-950/30 dark:text-red-400">
          <ShieldAlert className="h-3 w-3 mr-1" /> Reddedildi
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-50 border border-yellow-500 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
        <ShieldQuestion className="h-3 w-3 mr-1" /> Beklemede
      </Badge>
    );
  };

  return (
    <>
      <Card className="mt-4">
        <CardContent className="p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4 mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                KYC / Şirket Bilgileri <StatusBadge />
              </h2>
              {seller.kyc_reviewed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  İncelendi: {new Date(seller.kyc_reviewed_at).toLocaleString("tr-TR")}
                </p>
              )}
              {seller.consent_at && (
                <p className="text-xs text-muted-foreground">
                  KVKK onayı: {new Date(seller.consent_at).toLocaleString("tr-TR")}
                </p>
              )}
            </div>
            {seller.kyc_status === 0 && (
              <div className="flex gap-2">
                <ApplicationRejectModal
                  trigger={
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      disabled={isApproving || isRejecting}
                    >
                      Reddet
                    </Button>
                  }
                  onReject={onReject}
                  loading={isRejecting}
                />
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onApprove}
                  disabled={isApproving || isRejecting}
                >
                  {isApproving ? "Onaylanıyor..." : "Onayla"}
                </Button>
              </div>
            )}
          </div>

          {/* Iyzico merchant key — onaylandıysa */}
          {seller.kyc_status === 1 && (
            <div className="mb-4 rounded-md border bg-emerald-50 dark:bg-emerald-950/20 p-3">
              <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-medium mb-1">
                iyzico Sub-Merchant Key
              </div>
              {seller.iyzico_sub_merchant_key ? (
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono break-all">
                    {seller.iyzico_sub_merchant_key}
                  </code>
                  <button
                    type="button"
                    onClick={copyMerchantKey}
                    className="shrink-0 rounded p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                    title="Kopyala"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sub-merchant oluşturulamamış. iyzico marketplace mode kapalı olabilir veya hata oluşmuş — backend log&apos;una bakın.
                </p>
              )}
              {seller.iyzico_registered_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Kayıt tarihi: {new Date(seller.iyzico_registered_at).toLocaleString("tr-TR")}
                </p>
              )}
            </div>
          )}

          {seller.kyc_admin_note && (
            <div className="mb-4 rounded-md border bg-muted/50 p-3 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Admin Notu</div>
              <p className="whitespace-pre-line">{seller.kyc_admin_note}</p>
            </div>
          )}

          {/* Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Section icon={<Building2 className="h-4 w-4" />} title="Şirket">
              <Row label="Ünvan" value={seller.company_name} />
              <Row label="Marka" value={seller.brand_name} />
              <Row label="Sektör" value={seller.sector} />
              <Row label="Vergi Dairesi" value={seller.tax_office} />
              <Row label="Vergi / TC No" value={seller.tax_number} />
              <Row label="MERSİS No" value={seller.mersis_number} />
              <Row label="Web Sitesi" value={seller.website_url} />
            </Section>

            <Section icon={<MapPin className="h-4 w-4" />} title="Adres">
              <Row label="Ülke" value={seller.address_country} />
              <Row label="İl" value={seller.address_city} />
              <Row label="İlçe" value={seller.address_district} />
              <Row label="Posta Kodu" value={seller.address_postal_code} />
              <Row label="Adres" value={seller.address_line1} />
              {seller.address_line2 && <Row label="Adres 2" value={seller.address_line2} />}
            </Section>

            <Section icon={<CreditCard className="h-4 w-4" />} title="Banka">
              <Row label="Banka" value={seller.bank_name} />
              <Row label="Hesap Sahibi" value={seller.bank_account_holder} />
              <Row label="IBAN" value={seller.bank_iban} mono />
              {seller.bank_account_number && <Row label="Hesap No" value={seller.bank_account_number} />}
              {seller.bank_branch_code && <Row label="Şube Kodu" value={seller.bank_branch_code} />}
              {seller.bank_swift_code && <Row label="SWIFT" value={seller.bank_swift_code} />}
            </Section>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border p-3">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-muted-foreground">
        {icon} {title}
      </h3>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-muted-foreground shrink-0 w-24">{label}:</span>
      <span className={`flex-1 break-all ${mono ? "font-mono text-xs" : ""}`}>
        {value || <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  );
}
