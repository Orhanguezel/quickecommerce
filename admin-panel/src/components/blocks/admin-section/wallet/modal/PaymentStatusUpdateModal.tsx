import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { usePaymentStatusChange } from "@/modules/admin-section/wallet/wallet.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}
const PaymentStatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();

  const StatusList = [
    { label: t("common.paid"),    value: "paid" },
    { label: t("common.pending"), value: "pending" },
    { label: t("common.failed"),  value: "failed" },
  ];
  const { mutate: updateStoreStatus } = usePaymentStatusChange();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const [selectStatus, setSelectStatus] = useState<string>(row?.payment_status);
  const handleStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      transaction_id: row.id,
      payment_status: selectStatus,
    };
    const submissionData = {
      ...defaultData,
    };
    updateStoreStatus(
      { ...(submissionData as any) },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
          setIsModalOpen(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("button.confirm")}
      IsLoading={loading}
      onSave={handleSave}
      customClass="inset-x-40p top-[150px] md:top-[200px] lg:top-[200px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      smallModal
    >
      <div className="text-start ">
        <h1 className="text-2xl font-semibold text-blue-500 my-4">
          {t("common.status_update_modal")}
        </h1>
        <div
          className={`mt-4 transition-all duration-300 ${
            isSelectOpen ? "min-h-[220px]" : "min-h-[100px]"
          }`}
        >
          <p className="text-gray-500 dark:text-white my-2">
            {t("common.select_status_and_confirm")}
          </p>
          <AppSelect
            placeholder={t("place_holder.select_status")}
            value={String(selectStatus)}
            onSelect={handleStatus}
            groups={StatusList}
            hideNone
            onOpenChange={setIsSelectOpen}
          />
        </div>
      </div>
    </AppModal>
  );
};

export default PaymentStatusUpdateModal;
