import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Card } from "@/components/ui";
import { useOrdersPaymentStatusUpdate } from "@/modules/admin-section/orders/orders.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}
const StatusList = [
  { label: "Pending", value: "pending" },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const PaymentStatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const { mutate: updateStoreStatus } = useOrdersPaymentStatusUpdate();
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
      order_id: row.order_id,
      status: selectStatus,
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
        onError: (error: any) => {
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
          {t("common.payment_status_update_modal")}
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
