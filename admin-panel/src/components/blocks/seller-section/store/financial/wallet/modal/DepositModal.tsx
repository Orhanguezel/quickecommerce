import { AppModal } from "@/components/blocks/common/AppModal";
import { Input, Skeleton } from "@/components/ui";
import { usePaymentGatewayQuery } from "@/modules/common/payment-gateway/payment-gateway.action";
import { useDepositMutation } from "@/modules/seller-section/financial/wallet/wallet.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { Key, useState } from "react";
import PaymentOptionCard from "../../../components/PaymentOptionCard";
import { toast } from "react-toastify";
import type {  UploadedImage } from "@/components/blocks/shared/PhotoUploadModal";


interface DepositModalProps {
  onSave?: (images: UploadedImage[]) => void;
  trigger: any;
  MyWalletData: any;
}

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
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { PaymentGatewayList } = usePaymentGatewayQuery({});
  let PaymentGateways = (PaymentGatewayList as any)?.paymentGateways || [];
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<
    string | null
  >(null);
  const [prices, setPrices] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const store_id = selectedStore?.id;

  const cashOnDeliveryIndex = PaymentGateways.findIndex(
    (item: { id: number }) => item.id === 5
  );

  const beforeId5 =
    cashOnDeliveryIndex !== -1
      ? PaymentGateways.filter((item: { id: number }) => item.id !== 5)
      : PaymentGateways;

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              name: "Wallet",
              price: Number(prices),
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

  const { mutate: AmountDeposit } = useDepositMutation();
  const handleDeposit = async () => {
    const currency =
      selectedPaymentOption === "stripe"
        ? "USD"
        : selectedPaymentOption === "paypal"
        ? "INR"
        : "";
    const defaultData = {
      wallet_id: MyWalletData?.wallets?.id,
      amount: prices,
      payment_gateway: selectedPaymentOption,
      currency_code: currency,
      store_id: store_id,
    };
    return AmountDeposit(
      { ...(defaultData as any) },
      {
        onSuccess: (res) => {
          const id = (res as any)?.data?.wallet_history_id;
          localStorage.setItem("wallet_history_id", id);
          handleStripePayment();
          setPrices("");
          setSelectedPaymentOption("");
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
      handleDeposit();
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
                  {PaymentGateways?.map((index: any) => (
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
              </>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default DepositModal;
