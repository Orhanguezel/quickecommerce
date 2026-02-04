import { formatPrice } from "@/components/molecules/formatPrice";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Card } from "@/components/ui";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { usePaymentGatewayQuery } from "@/modules/common/payment-gateway/payment-gateway.action";
import { useWalletQuery } from "@/modules/seller-section/financial/wallet/wallet.action";
import {
  useBuyPackageMutation,
  usePackageRenewMutation,
} from "@/modules/seller-section/settings/business-plan/business-plan.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { Key, useMemo, useState } from "react";
import PaymentOptionCard from "../../../components/PaymentOptionCard";
import { toast } from "react-toastify";
import type {  UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";

interface PaymentMethodModalProps {
  onSave?: (images: UploadedImage[]) => void;
  trigger: any;
  subscription: any;
  paymentFor?: any;
  detailsRefetch?: any;
}

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
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { PaymentGatewayList } = usePaymentGatewayQuery({});
  let PaymentGateways = (PaymentGatewayList as any)?.paymentGateways || [];
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<
    string | null
  >(null);

  const cashOnDeliveryIndex = PaymentGateways.findIndex(
    (item: { id: number }) => item.id === 5
  );

  const beforeId5 =
    cashOnDeliveryIndex !== -1
      ? PaymentGateways.filter((item: { id: number }) => item.id !== 5)
      : PaymentGateways;

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
  const handleStripePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              name: subscription?.name,
              price: subscription?.price,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create Stripe session");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Error refetching data: ${error.message}`
          : "An unknown error occurred while refetching data"
      );
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const { mutate: PackageRenew } = usePackageRenewMutation();
  const handleRenew = async () => {
    const id = selectedStore?.id || "";
    const defaultData = {
      store_id: id,
      subscription_id: subscription?.id,
      payment_gateway: selectedPaymentOption,
    };

    return PackageRenew(
      { ...(defaultData as any) },
      {
        onSuccess: (res) => {
          const ResponseData = (res as any)?.data;
          if (ResponseData?.subscription_id) {
            localStorage.setItem(
              "subscription_id",
              ResponseData.subscription_id
            );
          }
          if (ResponseData?.subscription_history_id) {
            localStorage.setItem(
              "subscription_history_id",
              ResponseData.subscription_history_id
            );
          }
          handleStripePayment();
        },
      }
    );
  };
  const handleRenewByWallet = async () => {
    setLoading(true);
    const id = selectedStore?.id || "";
    const defaultData = {
      store_id: id,
      subscription_id: subscription?.id,
      payment_gateway: selectedPaymentOption,
    };

    return PackageRenew(
      { ...(defaultData as any) },
      {
        onSuccess: (data) => {
          setLoading(false);
          setIsModalOpen(false);
          detailsRefetch();
          toast.success((data as any)?.data?.message);
        },
        onError: (data) => {
          setLoading(false);
          detailsRefetch();
          toast.error((data as any)?.data?.message);
        },
      }
    );
  };

  const { mutate: BuyPackage } = useBuyPackageMutation();

  const handleBuyPackage = async () => {
    const id = selectedStore?.id || "";
    const defaultData = {
      store_id: id,
      subscription_id: subscription?.id,
      payment_gateway: selectedPaymentOption,
    };

    return BuyPackage(
      { ...(defaultData as any) },
      {
        onSuccess: (res) => {
          const ResponseData = (res as any)?.data;
          
          if (ResponseData?.subscription_id) {
            localStorage.setItem(
              "subscription_id",
              ResponseData.subscription_id
            );
          }
          if (ResponseData?.subscription_history_id) {
            localStorage.setItem(
              "subscription_history_id",
              ResponseData.subscription_history_id
            );
          }
          handleStripePayment();
        },
      }
    );
  };
  const handleBuyPackageByWallet = async () => {
    setLoading(true);
    const id = selectedStore?.id || "";
    const defaultData = {
      store_id: id,
      subscription_id: subscription?.id,
      payment_gateway: selectedPaymentOption,
    };

    return BuyPackage(
      { ...(defaultData as any) },
      {
        onSuccess: (data) => {
          detailsRefetch();
          setLoading(false);
          setIsModalOpen(false);
          toast.success((data as any)?.data?.message);
        },
        onError: (data) => {
          setLoading(false);
          detailsRefetch();
          toast.error((data as any)?.data?.message);
        },
      }
    );
  };

  const handleSave = () => {
    const slug = selectedStore?.slug || "";
    const id = selectedStore?.id || "";
    const type = selectedStore?.type || "";
    if (selectedPaymentOption === "stripe") {
      dispatch(setSelectedStore({ id, type, slug }));
      if (paymentFor === "renew") {
        handleRenew();
      }
      if (paymentFor === "subscription") {
        handleBuyPackage();
      }
    }
    if (selectedPaymentOption === "wallet") {
      dispatch(setSelectedStore({ id, type, slug }));
      if (paymentFor === "renew") {
        handleRenewByWallet();
      }
      if (paymentFor === "subscription") {
        handleBuyPackageByWallet();
      }
    }
  };
  const handleCardClick = (optionId: string) => {
    setSelectedPaymentOption(
      optionId === selectedPaymentOption ? null : optionId
    );
  };
  return (
    <AppModal
      trigger={trigger}
      disable={selectedPaymentOption === null || loading}
      actionButtonLabel="Pay Now"
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
                  <p>Wallet</p>
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
                Via Online
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              {beforeId5?.map(
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
          </Card>
        </div>
      </div>
    </AppModal>
  );
};

export default PaymentMethodModal;
