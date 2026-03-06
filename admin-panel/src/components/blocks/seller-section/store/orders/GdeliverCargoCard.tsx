"use client";
import { Button, Card, CardContent } from "@/components/ui";
import {
  useSellerCreateCargoMutation,
  useSellerCancelCargoMutation,
  useSellerOrderCargoOffersQuery,
  useSellerOrderCargoQuery,
} from "@/modules/seller-section/orders/cargo/orders-cargo.action";
import { ExternalLink, Package, X, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  cancelled: "Iptal",
};

const GdeliverCargoCard = ({
  orderId,
  orderStatus,
  refetch,
}: GdeliverCargoCardProps) => {
  const {
    cargoData,
    isPending: isLoading,
    refetch: refetchCargo,
  } = useSellerOrderCargoQuery(orderId);

  const { mutate: createCargo, isPending: isCreating } =
    useSellerCreateCargoMutation(orderId);
  const { mutate: cancelCargo, isPending: isCancelling } =
    useSellerCancelCargoMutation(orderId);

  const handleCreate = () => {
    setCreateError(null);
    const payload = selectedOfferId ? { offer_id: selectedOfferId } : undefined;
    createCargo(payload as any, {
      onSuccess: () => {
        refetchCargo();
        refetch();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Kargo olusturulurken hata olustu.";
        setCreateError(typeof msg === "string" ? msg : JSON.stringify(msg));
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

  const {
    offersData,
    isPending: isOffersLoading,
    error: offersError,
    refetch: refetchOffers,
  } = useSellerOrderCargoOffersQuery(orderId, false);

  const offersErrorMessage = useMemo(() => {
    if (!offersError) return null;
    return (offersError as any)?.response?.data?.message ?? "Teklifler yuklenirken hata olustu.";
  }, [offersError]);

  const offers = useMemo(() => {
    const list = offersData?.offers;
    return Array.isArray(list) ? list : [];
  }, [offersData]);

  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [offersLoadedOnce, setOffersLoadedOnce] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && canCreate && !offersLoadedOnce && !isOffersLoading) {
      setOffersLoadedOnce(true);
      refetchOffers();
    }
  }, [isLoading, canCreate, offersLoadedOnce, isOffersLoading, refetchOffers]);

  useEffect(() => {
    if (!offers.length) {
      setSelectedOfferId("");
      return;
    }
    const defaultId = String(offersData?.default_offer_id ?? offers[0]?.id ?? "");
    setSelectedOfferId(defaultId);
  }, [offers, offersData?.default_offer_id]);

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
              <span className="text-gray-500">Kargo Firmasi</span>
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
                Kargo Etiketini Ac
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
                {isCancelling ? "Iptal ediliyor..." : "Kargoyu Iptal Et"}
              </Button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Bu siparis icin henuz Geliver kargo olusturulmamis.
            </p>
            {canCreate ? (
              <>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-600">Kargo firmasi secimi</p>
                    <button
                      type="button"
                      onClick={() => refetchOffers()}
                      className="text-xs text-blue-500 hover:underline disabled:text-gray-300"
                      disabled={isOffersLoading || isCreating}
                    >
                      {isOffersLoading ? "Yukleniyor..." : offers.length ? "Teklifleri yenile" : "Teklifleri getir"}
                    </button>
                  </div>

                  {offersErrorMessage && (
                    <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded p-2 mb-2">
                      <AlertTriangle width={14} height={14} className="shrink-0 mt-0.5" />
                      <span>{offersErrorMessage}</span>
                    </div>
                  )}

                  <select
                    className="w-full border rounded px-2 py-2 text-sm bg-white"
                    value={selectedOfferId}
                    onChange={(e) => setSelectedOfferId(e.target.value)}
                    disabled={isOffersLoading || !offers.length || isCreating}
                  >
                    {!offers.length && (
                      <option value="">
                        {isOffersLoading
                          ? "Teklifler yukleniyor..."
                          : "Teklif bulunamadi (en ucuz otomatik secilir)"}
                      </option>
                    )}
                    {offers.map((offer: any) => (
                      <option key={String(offer.id)} value={String(offer.id)}>
                        {offer.carrier_name ?? "Bilinmeyen Kurye"}
                        {offer.price_text ? ` - ${offer.price_text}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Secim yapilmazsa sistem varsayilan olarak en uygun teklifi kullanir.
                  </p>
                </div>

                {createError && (() => {
                  const isMahalleError = createError.toLowerCase().includes("mahalle");
                  return (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 mb-3 text-sm text-red-700">
                      <div className="flex items-start gap-2">
                        <AlertTriangle width={16} height={16} className="shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <p className="font-medium">Kargo olusturulamadi</p>
                          <p className="text-xs">{createError}</p>
                          {isMahalleError && (
                            <div className="mt-2 rounded bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800 space-y-1">
                              <p className="font-semibold">Ne yapmalisiniz?</p>
                              <p>Lutfen magaza adres bilgilerinizde mahalle alaninin dogru dolduruldugundan emin olun. Sorun devam ederse yonetici ile iletisime gecin.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  <Package width={14} height={14} className="mr-1" />
                  {isCreating ? "Kargo olusturuluyor..." : "Geliver ile Kargo Olustur"}
                </Button>
              </>
            ) : (
              <p className="text-xs text-gray-400">
                {orderStatus === "pending"
                  ? "Siparis henuz onaylanmadi."
                  : "Bu siparis icin kargo olusturulamaz."}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GdeliverCargoCard;
