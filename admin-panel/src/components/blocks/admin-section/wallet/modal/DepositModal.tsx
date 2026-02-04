import { AppModal } from "@/components/blocks/common/AppModal";
import { Card, Input } from "@/components/ui";
import { usePaymentGatewayQuery } from "@/modules/common/payment-gateway/payment-gateway.action";
import { useDepositMutation } from "@/modules/seller-section/financial/wallet/wallet.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedStore } from "@/redux/slices/storeSlice";
import React, { Key, useState } from "react";
import PaymentOptionCard from "../components/PaymentOptionCard";
import type {UploadedImage}  from "@/components/blocks/shared/PhotoUploadModal";



interface DepositModalProps {
  onSave?: (images: UploadedImage[]) => void;
  trigger: any;
  MyWalletData: any;
}

const DepositModal: React.FC<DepositModalProps> = ({
  trigger,
  MyWalletData,
}) => {
  const dispatch = useAppDispatch();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const { PaymentGatewayList } = usePaymentGatewayQuery({});
  let PaymentGateways = (PaymentGatewayList as any)?.paymentGateways || [];
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<
    string | null
  >(null);
  const [prices, setPrices] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              price: prices,
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
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const { mutate: AmountDeposit } = useDepositMutation();
  const handleDeposit = async () => {
    const defaultData = {
      wallet_id: MyWalletData?.wallets?.id,
      amount: prices,
      payment_gateway: selectedPaymentOption,
    };

    return AmountDeposit(
      { ...(defaultData as any) },
      {
        onSuccess: (res) => {
          const id = (res as any)?.data?.wallet_history_id;
          localStorage.setItem("wallet_history_id", id);
          handleStripePayment();
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
      disable={selectedPaymentOption === null || loading}
      actionButtonLabel={loading ? "loading.." : "Pay Now"}
      customClass=" lg:inset-x-30p md:inset-x-30p lg:top-[200px] md:top-[200px] top-[200px]"
      onSave={handleSave}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="w-full flex items-center justify-center">
        <Card className="p-2 md:p-6 w-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-500">Payment Method</h2>
            <p className="text-gray-500 dark:text-white">
              Manage your payment manually.
            </p>
          </div>
          <div className="shadow-xl rounded p-4">
            <p className="text-sm font-medium mb-1">Amount</p>
            <Input
              type="number"
              className="app-input"
              placeholder="Enter price"
              value={prices ?? ""}
              onChange={(e) => setPrices(Number(e.target.value))}
            />
            <p className="text-sm font-medium my-2">Payment Gateway</p>
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8">
              {PaymentGateways?.map(
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
          </div>
        </Card>
      </div>
    </AppModal>
  );
};

export default DepositModal;
