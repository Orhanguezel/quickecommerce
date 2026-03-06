import { AppModal } from "@/components/blocks/common/AppModal";
import { Input, Skeleton } from "@/components/ui";
import { usePaymentGatewayQuery } from "@/modules/common/payment-gateway/payment-gateway.action";
import {
  useCreateIyzicoSessionMutation,
  useCreatePayTRSessionMutation,
  useDepositMutation,
} from "@/modules/seller-section/financial/wallet/wallet.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { Key, useState } from "react";
import PaymentOptionCard from "../../../components/PaymentOptionCard";
import { toast } from "react-toastify";
import type { UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";

interface DepositModalProps {
  onSave?: (images: UploadedImage[]) => void;
  trigger: any;
  MyWalletData: any;
}

const SUPPORTED_GATEWAYS = ["iyzico", "paytr"];

const DepositModal: React.FC<DepositModalProps> = ({
  onSave,
  trigger,
  MyWalletData,
}) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const { PaymentGatewayList } = usePaymentGatewayQuery({});
  let PaymentGateways = (PaymentGatewayList as any)?.paymentGateways || [];
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<
    string | null
  >(null);
  const [prices, setPrices] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paytrIframeUrl, setPaytrIframeUrl] = useState<string | null>(null);
  const store_id = selectedStore?.id;

  // Filter: only show supported gateways (iyzico, paytr), exclude COD (id=5)
  const filteredGateways = PaymentGateways.filter(
    (item: { id: number; slug: string }) =>
      item.id !== 5 && SUPPORTED_GATEWAYS.includes(item.slug)
  );

  const { mutate: AmountDeposit } = useDepositMutation();
  const { mutateAsync: createIyzicoSession } =
    useCreateIyzicoSessionMutation();
  const { mutateAsync: createPayTRSession } = useCreatePayTRSessionMutation();

  const handleIyzicoPayment = async (
    walletId: number,
    walletHistoryId: number
  ) => {
    try {
      const res = await createIyzicoSession({
        wallet_id: walletId,
        wallet_history_id: walletHistoryId,
      });
      const checkoutUrl = (res as any)?.data?.data?.checkout_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error(t("common.payment_session_failed"));
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const handlePayTRPayment = async (
    walletId: number,
    walletHistoryId: number
  ) => {
    try {
      const res = await createPayTRSession({
        wallet_id: walletId,
        wallet_history_id: walletHistoryId,
      });
      const iframeUrl = (res as any)?.data?.data?.iframe_url;
      if (iframeUrl) {
        setPaytrIframeUrl(iframeUrl);
      } else {
        toast.error(t("common.payment_session_failed"));
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedPaymentOption || !prices || !MyWalletData?.wallets?.id) return;

    setLoading(true);
    const defaultData = {
      wallet_id: MyWalletData?.wallets?.id,
      amount: prices,
      payment_gateway: selectedPaymentOption,
      currency_code: "TRY",
      store_id: store_id,
    };

    AmountDeposit(
      { ...(defaultData as any) },
      {
        onSuccess: (res) => {
          const walletHistoryId = (res as any)?.data?.wallet_history_id;
          const walletId = MyWalletData?.wallets?.id;

          if (!walletHistoryId) {
            toast.error(t("common.something_went_wrong"));
            setLoading(false);
            return;
          }

          localStorage.setItem("wallet_history_id", walletHistoryId);

          if (selectedPaymentOption === "iyzico") {
            handleIyzicoPayment(walletId, walletHistoryId);
          } else if (selectedPaymentOption === "paytr") {
            handlePayTRPayment(walletId, walletHistoryId);
          } else {
            toast.error(t("common.payment_gateway_not_supported"));
            setLoading(false);
          }
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  const handleSave = () => {
    const slug = selectedStore?.slug || "";
    const id = selectedStore?.id || "";
    const type = selectedStore?.type || "";
    dispatch(setSelectedStore({ id, type, slug }));
    handleDeposit();
  };

  const handleCardClick = (optionId: string) => {
    setSelectedPaymentOption(
      optionId === selectedPaymentOption ? null : optionId
    );
  };

  // PayTR iframe view
  if (paytrIframeUrl) {
    return (
      <AppModal
        trigger={trigger}
        disable={false}
        actionButtonLabel={t("button.close")}
        customClass="inset-x-5p md:inset-x-10p lg:inset-x-15p top-[30px] lg:top-[50px]"
        onSave={() => {
          setPaytrIframeUrl(null);
          setLoading(false);
          setIsModalOpen(false);
          setPrices("");
          setSelectedPaymentOption(null);
        }}
        IsLoading={false}
        isOpen={true}
        onOpenChange={(open) => {
          if (!open) {
            setPaytrIframeUrl(null);
            setLoading(false);
            setPrices("");
            setSelectedPaymentOption(null);
          }
          setIsModalOpen(open);
        }}
      >
        <div className="w-full flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-blue-500 mb-4">
            {t("common.complete_payment")}
          </h2>
          <iframe
            src={paytrIframeUrl}
            className="w-full border-0 rounded-lg"
            style={{ height: "500px", minHeight: "400px" }}
            allowFullScreen
          />
        </div>
      </AppModal>
    );
  }

  return (
    <AppModal
      trigger={trigger}
      disable={
        selectedPaymentOption === null ||
        prices == "" ||
        loading ||
        !MyWalletData?.wallets?.id
      }
      actionButtonLabel={t("button.deposit")}
      customClass="inset-x-5p md:inset-x-10p lg:inset-x-20p xl:inset-x-30p top-[50px] lg:top-[100px]"
      onSave={handleSave}
      IsLoading={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="w-full flex items-center justify-center">
        <div className="p-2 md:p-4 w-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500">
              {t("common.deposit_to_wallet")}
            </h2>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded p-2 md:p-4">
            {loading ? (
              <>
                <p className="text-sm font-medium mb-2">
                  {t("common.deposit_amount")}
                </p>
                <Skeleton className="w-full h-[40px] rounded " />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {PaymentGateways?.map((_: any, index: number) => (
                    <Skeleton
                      key={index}
                      className="w-full h-[80px] rounded-lg "
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-medium mb-2">
                  {t("common.deposit_amount")}
                </p>
                <Input
                  type="number"
                  min={0}
                  className="app-input"
                  placeholder={t("place_holder.enter_deposit_amount")}
                  value={prices ?? ""}
                  onChange={(e) => setPrices(e.target.value)}
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 mt-8 mb-4">
                  {filteredGateways?.map(
                    (option: {
                      id: Key | null | undefined;
                      image_url: unknown;
                      name: string;
                      slug: string;
                    }) => (
                      <PaymentOptionCard
                        key={option.id}
                        isSelected={selectedPaymentOption === option.slug}
                        onClick={() => handleCardClick(option.slug)}
                        imageSrc={option?.image_url}
                        title={option.name}
                      />
                    )
                  )}
                </div>

                {filteredGateways.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {t("common.no_payment_gateway_available")}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default DepositModal;
