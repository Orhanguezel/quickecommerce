import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { useSellerStatusUpdate } from "@/modules/admin-section/seller/seller.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}
const StatusList = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "0" },
  { label: "Suspended", value: "2" },
];

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const { mutate: updateStoreStatus } = useSellerStatusUpdate();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const [selectStatus, setSelectStatus] = useState<string>(row?.status);
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
      actionButtonLabel={t("button.confirm")}
      IsLoading={loading}
      onSave={handleSave}
      customClass="inset-x-40p top-[150px] md:top-[200px] lg:top-[200px]"
      isOpen={isModalOpen} // Bind modal open state
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
          <p className="text-gray-500 dark:text-white mb-2">
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

export default StatusUpdateModal;
