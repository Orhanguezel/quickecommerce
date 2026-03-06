import { formatPrice } from "@/components/molecules/formatPrice";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Card } from "@/components/ui";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { usePaymentGatewayQuery } from "@/modules/common/payment-gateway/payment-gateway.action";
import { useWalletQuery } from "@/modules/seller-section/financial/wallet/wallet.action";
import {
  useBuyPackageMutation,
  useCreateSubscriptionIyzicoSessionMutation,
  useCreateSubscriptionPayTRSessionMutation,
  usePackageRenewMutation,
} from "@/modules/seller-section/settings/business-plan/business-plan.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { useTranslations } from "next-intl";
import React, { Key, useMemo, useState } from "react";
import PaymentOptionCard from "../../../components/PaymentOptionCard";
import { toast } from "react-toastify";
import type { UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";

interface PaymentMethodModalProps {
  onSave?: (images: UploadedImage[]) => void;
  trigger: any;
  subscription: any;
  paymentFor?: any;
  detailsRefetch?: any;
}

const SUPPORTED_GATEWAYS = ["iyzico", "paytr"];

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  onSave,
  trigger,
  subscription,
  paymentFor,
  detailsRefetch,
}) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id ?? "";
  const { PaymentGatewayList } = usePaymentGatewayQuery({});
  let PaymentGateways = (PaymentGatewayList as any)?.paymentGateways || [];
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<
    string | null
  >(null);

  // Filter: only show supported gateways (iyzico, paytr) + wallet, exclude COD (id=5)
  const filteredGateways = PaymentGateways.filter(
    (item: { id: number; slug: string }) =>
      item.id !== 5 && SUPPORTED_GATEWAYS.includes(item.slug)
  );

  const { WalletDetails } = useWalletQuery({ store_id });
  let WalletDetailsData = (WalletDetails as any)?.wallets || {};
  const { currency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paytrIframeUrl, setPaytrIframeUrl] = useState<string | null>(null);

  const { mutate: PackageRenew } = usePackageRenewMutation();
  const { mutate: BuyPackage } = useBuyPackageMutation();
  const { mutateAsync: createIyzicoSession } =
    useCreateSubscriptionIyzicoSessionMutation();
  const { mutateAsync: createPayTRSession } =
    useCreateSubscriptionPayTRSessionMutation();

  const handleIyzicoPayment = async (subscriptionHistoryId: number) => {
    try {
      const res = await createIyzicoSession({
        subscription_history_id: subscriptionHistoryId,
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

  const handlePayTRPayment = async (subscriptionHistoryId: number) => {
    try {
      const res = await createPayTRSession({
        subscription_history_id: subscriptionHistoryId,
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

  const handlePaymentGateway = (subscriptionHistoryId: number) => {
    if (selectedPaymentOption === "iyzico") {
      handleIyzicoPayment(subscriptionHistoryId);
    } else if (selectedPaymentOption === "paytr") {
      handlePayTRPayment(subscriptionHistoryId);
    } else {
      toast.error(t("common.payment_gateway_not_supported"));
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    setLoading(true);
    const id = selectedStore?.id || "";
    const defaultData = {
      store_id: id,
      subscription_id: subscription?.id,
      payment_gateway: selectedPaymentOption,
    };

    PackageRenew(
      { ...(defaultData as any) },
      {
        onSuccess: (res) => {
          const ResponseData = (res as any)?.data;
          const subscriptionHistoryId = ResponseData?.subscription_history_id;

          if (ResponseData?.subscription_id) {
            localStorage.setItem("subscription_id", ResponseData.subscription_id);
          }
          if (subscriptionHistoryId) {
            localStorage.setItem("subscription_history_id", subscriptionHistoryId);
          }

          if (selectedPaymentOption === "wallet") {
            setLoading(false);
            setIsModalOpen(false);
            detailsRefetch?.();
            toast.success(ResponseData?.message);
          } else if (subscriptionHistoryId) {
            handlePaymentGateway(subscriptionHistoryId);
          } else {
            toast.error(t("common.something_went_wrong"));
            setLoading(false);
          }
        },
        onError: (data) => {
          setLoading(false);
          detailsRefetch?.();
          const errorText = (data as any)?.response?.data;
          if (errorText && typeof errorText === "object") {
            Object.entries(errorText).forEach(([key, messages]) => {
              if (Array.isArray(messages)) {
                messages.forEach((msg) => toast.error(msg));
              } else if (typeof messages === "string") {
                toast.error(messages);
              }
            });
          } else {
            toast.error(errorText?.message);
          }
        },
      }
    );
  };

  const handleBuyPackage = async () => {
    setLoading(true);
    const id = selectedStore?.id || "";
    const defaultData = {
      store_id: id,
      subscription_id: subscription?.id,
      payment_gateway: selectedPaymentOption,
    };

    BuyPackage(
      { ...(defaultData as any) },
      {
        onSuccess: (res) => {
          const ResponseData = (res as any)?.data;
          const subscriptionHistoryId = ResponseData?.subscription_history_id;

          if (ResponseData?.subscription_id) {
            localStorage.setItem("subscription_id", ResponseData.subscription_id);
          }
          if (subscriptionHistoryId) {
            localStorage.setItem("subscription_history_id", subscriptionHistoryId);
          }

          if (selectedPaymentOption === "wallet") {
            setLoading(false);
            setIsModalOpen(false);
            detailsRefetch?.();
            toast.success(ResponseData?.message);
          } else if (subscriptionHistoryId) {
            handlePaymentGateway(subscriptionHistoryId);
          } else {
            toast.error(t("common.something_went_wrong"));
            setLoading(false);
          }
        },
        onError: (data) => {
          setLoading(false);
          detailsRefetch?.();
          const errorText = (data as any)?.response?.data;
          if (errorText && typeof errorText === "object") {
            Object.entries(errorText).forEach(([key, messages]) => {
              if (Array.isArray(messages)) {
                messages.forEach((msg) => toast.error(msg));
              } else if (typeof messages === "string") {
                toast.error(messages);
              }
            });
          } else {
            toast.error(errorText?.message);
          }
        },
      }
    );
  };

  const handleSave = () => {
    const slug = selectedStore?.slug || "";
    const id = selectedStore?.id || "";
    const type = selectedStore?.type || "";
    dispatch(setSelectedStore({ id, type, slug }));

    if (paymentFor === "renew") {
      handleRenew();
    } else if (paymentFor === "subscription") {
      handleBuyPackage();
    }
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
          setSelectedPaymentOption(null);
        }}
        IsLoading={false}
        isOpen={true}
        onOpenChange={(open) => {
          if (!open) {
            setPaytrIframeUrl(null);
            setLoading(false);
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
      disable={selectedPaymentOption === null || loading}
      actionButtonLabel={t("button.pay_now")}
      customClass="inset-x-0 md:inset-x-10p xl:inset-x-30p top-[100px] md:top-[200px]"
      onSave={handleSave}
      IsLoading={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="w-full flex items-center justify-center">
        <div className="w-full">
          <div className="p-2 mb-6">
            <h2 className="text-xl font-bold text-blue-500">
              {t("label.payment")}
            </h2>
          </div>
          <Card className="p-2 md:p-6">
            <div className="border-b border-slate-300 flex items-center justify-between pb-4">
              <div
                className={`flex items-center justify-between gap-4 relative border-2 rounded-lg px-4 py-2 w-auto cursor-pointer dark:bg-white ${
                  selectedPaymentOption === "wallet"
                    ? "border-blue-500"
                    : "border-slate-300 hover:border-blue-500 "
                }`}
                onClick={() => handleCardClick("wallet")}
              >
                <div className="flex items-center justify-center">
                  <div
                    className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                      selectedPaymentOption === "wallet"
                        ? "bg-white border-blue-500"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {selectedPaymentOption === "wallet" && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>

                <div
                  className={`px-2 py-1 text-2xl font-bold  ${
                    selectedPaymentOption === "wallet"
                      ? "text-blue-500"
                      : "text-slate-500"
                  } `}
                >
                  <p>{t("label.wallets")}</p>
                  <p className="text-sm">
                    {WalletDetailsData?.total_balance
                      ? formatPrice(
                          WalletDetailsData?.total_balance,
                          CurrencyData
                        )
                      : WalletDetailsData?.total_balance}
                  </p>
                </div>
              </div>
            </div>
            <div className="my-4 w-full">
              <p className="text-md font-semibold text-gray-500 dark:text-white">
                {t("common.pay_via_online")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
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
          </Card>
        </div>
      </div>
    </AppModal>
  );
};

export default PaymentMethodModal;
