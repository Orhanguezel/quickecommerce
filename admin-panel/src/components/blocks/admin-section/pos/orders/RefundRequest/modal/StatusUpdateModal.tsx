import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Card } from "@/components/ui";
import { useRefundRequestStatusUpdate } from "@/modules/seller-section/orders/refund-request/refund-request.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}
const statusList = [
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" }
];

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const { mutate: updateStoreStatus } = useRefundRequestStatusUpdate();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectStatus, setSelectStatus] = useState<string>(row?.status);
  const handleStatusChange = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectOwner);
    }
  };

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      id: row.id,
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
      actionButtonLabel={t("common.confirm")}
      IsLoading={loading}
      onSave={handleSave}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[200px] md:top-[200px] top-[100px]"
      isOpen={isModalOpen} // Bind modal open state
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-blue-500">
          {t("common.status_update_modal")}
        </h1>

        <Card className="p-4 my-4 min-h-[280px]">
          <p className="text-sm font-semibold text-gray-500 dark:text-white mb-2">
            {t("common.select_status_and_confirm")}
          </p>

          <AppSelect
            placeholder={t("place_holder.select_status")}
            value={String(selectStatus)}
            onSelect={handleStatusChange}
            groups={statusList}
          />
        </Card>
      </div>
    </AppModal>
  );
};

export default StatusUpdateModal;
