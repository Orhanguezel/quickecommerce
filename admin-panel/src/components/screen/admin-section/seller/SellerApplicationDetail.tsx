"use client";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import {
  useSellerApplicationDetailsQuery,
  useSellerApplicationApprove,
  useSellerApplicationReject,
} from "@/modules/admin-section/seller/seller-application.action";
import { ArrowLeft, Building2, CreditCard, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import ApplicationRejectModal from "@/components/blocks/admin-section/seller/modal/ApplicationRejectModal";
import Loader from "@/components/molecules/Loader";

const SellerApplicationDetail = ({ id }: { id: string }) => {
  const router = useRouter();
  const { application, isPending } = useSellerApplicationDetailsQuery(id);
  const { mutate: approveApplication, isPending: isApproving } =
    useSellerApplicationApprove();
  const { mutate: rejectApplication, isPending: isRejecting } =
    useSellerApplicationReject();

  const handleApprove = () => {
    approveApplication(
      { id },
      {
        onSuccess: () => router.push(Routes.SellerApplications),
      }
    );
  };

  const handleReject = (note: string) => {
    rejectApplication(
      { id, admin_note: note },
      {
        onSuccess: () => router.push(Routes.SellerApplications),
      }
    );
  };

  if (isPending) {
    return <Loader />;
  }

  if (!application) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Başvuru bulunamadı.
        </CardContent>
      </Card>
    );
  }

  const statusBadge = () => {
    const s = application.status;
    if (s === 0)
      return (
        <Badge className="bg-yellow-50 border border-yellow-500 text-yellow-600">
          Beklemede
        </Badge>
      );
    if (s === 1)
      return (
        <Badge className="bg-green-50 border border-green-500 text-green-500">
          Onaylandı
        </Badge>
      );
    return (
      <Badge className="bg-red-50 border border-red-500 text-red-500">
        Reddedildi
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-4">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <Link href={Routes.SellerApplications}>
              <Button variant="outline" size="sm">
                <ArrowLeft width={16} height={16} />
              </Button>
            </Link>
            <h1 className="text-lg md:text-2xl font-semibold">
              Başvuru Detayı
            </h1>
            {statusBadge()}
          </div>
          {application.status === 0 && (
            <div className="flex gap-2">
              <ConfirmationModal
                trigger={
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Onayla
                  </Button>
                }
                onSave={handleApprove}
                loading={isApproving}
                title="Başvuruyu Onayla"
                subTitle="Bu satıcı başvurusunu onaylamak istediğinize emin misiniz? Satıcı hesabı aktif edilecek."
              />
              <ApplicationRejectModal
                trigger={
                  <Button variant="destructive">Reddet</Button>
                }
                onReject={handleReject}
                loading={isRejecting}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <User width={18} height={18} /> Kişisel Bilgiler
            </h2>
            <div className="space-y-3">
              <InfoRow label="Ad Soyad" value={`${application.user?.first_name} ${application.user?.last_name || ""}`} />
              <InfoRow label="E-posta" value={application.user?.email} />
              <InfoRow label="Telefon" value={application.user?.phone || "-"} />
              <InfoRow
                label="Başvuru Tarihi"
                value={
                  application.created_at
                    ? new Date(application.created_at).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Building2 width={18} height={18} /> Şirket Bilgileri
            </h2>
            <div className="space-y-3">
              <InfoRow label="Şirket Adı" value={application.company_name} />
              <InfoRow label="Marka Adı" value={application.brand_name || "-"} />
              <InfoRow label="Sektör" value={application.sector} />
              <InfoRow label="Vergi Dairesi" value={application.tax_office || "-"} />
              <InfoRow label="Vergi No" value={application.tax_number} />
              <InfoRow label="MERSİS No" value={application.mersis_number || "-"} />
              <InfoRow label="Web Sitesi" value={application.website_url || "-"} />
            </div>
          </CardContent>
        </Card>

        {/* Address Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <MapPin width={18} height={18} /> Adres Bilgileri
            </h2>
            <div className="space-y-3">
              <InfoRow label="Ülke" value={application.address?.country || "Türkiye"} />
              <InfoRow label="İl" value={application.address?.city} />
              <InfoRow label="İlçe" value={application.address?.district} />
              <InfoRow label="Posta Kodu" value={application.address?.postal_code || "-"} />
              <InfoRow label="Adres" value={application.address?.address_line1} />
              <InfoRow label="Adres 2" value={application.address?.address_line2 || "-"} />
            </div>
          </CardContent>
        </Card>

        {/* Bank Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <CreditCard width={18} height={18} /> Banka Bilgileri
            </h2>
            <div className="space-y-3">
              <InfoRow label="Banka" value={application.bank?.bank_name} />
              <InfoRow label="Hesap Sahibi" value={application.bank?.account_holder} />
              <InfoRow label="IBAN" value={application.bank?.iban} />
              <InfoRow label="Hesap No" value={application.bank?.account_number || "-"} />
              <InfoRow label="Şube Kodu" value={application.bank?.branch_code || "-"} />
              <InfoRow label="SWIFT" value={application.bank?.swift_code || "-"} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Note */}
      {application.note && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-2">Başvuru Notu</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {application.note}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Admin Note (if reviewed) */}
      {application.admin_note && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-2">Admin Notu</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {application.admin_note}
            </p>
            {application.reviewed_at && (
              <p className="text-xs text-gray-400 mt-2">
                {new Date(application.reviewed_at).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
    <span className="text-sm text-gray-500 dark:text-gray-400 sm:w-36 shrink-0">
      {label}:
    </span>
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
      {value}
    </span>
  </div>
);

export default SellerApplicationDetail;
