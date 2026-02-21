"use client";
import { Button, Card, CardContent } from "@/components/ui";
import {
  useCreateCargoMutation,
  useCancelCargoMutation,
  useOrderCargoQuery,
} from "@/modules/admin-section/orders/cargo/orders-cargo.action";
import { ExternalLink, Package, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface GdeliverCargoCardProps {
  orderId: string | number;
  orderStatus?: string;
  refetch: () => void;
}

const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  shipped: "Kargoya Verildi",
  in_transit: "Yolda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
};

const GdeliverCargoCard = ({
  orderId,
  orderStatus,
  refetch,
}: GdeliverCargoCardProps) => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] ?? "tr";
  const settingsUrl = `/${locale}/admin/system-management/cargo-settings`;

  const {
    cargoData,
    isPending: isLoading,
    refetch: refetchCargo,
  } = useOrderCargoQuery(orderId);

  const { mutate: createCargo, isPending: isCreating } =
    useCreateCargoMutation(orderId);
  const { mutate: cancelCargo, isPending: isCancelling } =
    useCancelCargoMutation(orderId);

  const handleCreate = () => {
    createCargo(undefined as any, {
      onSuccess: () => {
        refetchCargo();
        refetch();
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? "";
        if (msg.includes("token") || msg.includes("API")) {
          // Toast already shown by mutation, no extra action needed
        }
      },
    });
  };

  const handleCancel = () => {
    cancelCargo(undefined as any, {
      onSuccess: () => {
        refetchCargo();
        refetch();
      },
    });
  };

  const canCreate =
    !cargoData &&
    orderStatus !== "cancelled" &&
    orderStatus !== "delivered" &&
    orderStatus !== "pending";

  const canCancel =
    cargoData &&
    cargoData.status !== "cancelled" &&
    cargoData.status !== "delivered";

  return (
    <Card>
      <CardContent className="p-6 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Package width={24} height={24} className="text-orange-500 mt-0.5" />
          <h2 className="text-lg md:text-2xl font-medium">Geliver Kargo</h2>
        </div>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        ) : cargoData ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Kargo Firması</span>
              <span className="font-semibold">
                {cargoData.carrier_name ?? "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Takip No</span>
              <span className="font-semibold">
                {cargoData.tracking_number ?? "-"}
              </span>
            </div>
            {cargoData.barcode && (
              <div className="flex justify-between">
                <span className="text-gray-500">Barkod</span>
                <span className="font-semibold">{cargoData.barcode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Durum</span>
              <span className="font-semibold">
                {statusLabels[cargoData.status] ?? cargoData.status}
              </span>
            </div>

            {cargoData.label_url && (
              <a
                href={cargoData.label_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline pt-1"
              >
                <ExternalLink width={14} height={14} />
                Kargo Etiketini Aç
              </a>
            )}

            {canCancel && (
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-500 hover:bg-red-50 mt-3"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                <X width={14} height={14} className="mr-1" />
                {isCancelling ? "İptal ediliyor..." : "Kargoyu İptal Et"}
              </Button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Bu sipariş için henüz Geliver kargo oluşturulmamış.
            </p>
            {canCreate ? (
              <>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  <Package width={14} height={14} className="mr-1" />
                  {isCreating ? "Kargo oluşturuluyor..." : "Geliver ile Kargo Oluştur"}
                </Button>
                <Link
                  href={settingsUrl}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 mt-2"
                >
                  <Settings width={12} height={12} />
                  Kurye Ayarları → API token ve gönderici adres ID gerekli
                </Link>
              </>
            ) : (
              <p className="text-xs text-gray-400">
                {orderStatus === "pending"
                  ? "Sipariş henüz onaylanmadı."
                  : "Bu sipariş için kargo oluşturulamaz."}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GdeliverCargoCard;
