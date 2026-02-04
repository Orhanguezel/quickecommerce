import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { useProductStatusUpdate } from "@/modules/admin-section/products/product.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}

const StatusList = [
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const { mutate: updateStoreStatus } = useProductStatusUpdate();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectStatus, setSelectStatus] = useState<string>(row?.status || "");

  const handleStatus = (value: string) => {
    setSelectStatus(value);
  };

  const handleSave = () => {
    setLoading(true);
    const submissionData = { id: row.id, status: selectStatus };

    updateStoreStatus(submissionData, {
      onSuccess: () => {
        refetch();
        setLoading(false);
        setIsModalOpen(false);
      },
      onError: (error: any) => {
        setLoading(false);
      },
    });
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel="Confirm"
      IsLoading={loading}
      onSave={handleSave}
      customClass="inset-x-40p top-[150px] md:top-[200px] lg:top-[200px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      smallModal
    >
      <div className="text-start">
        <h1 className="text-2xl font-semibold text-blue-500 my-4">
          {t("common.status_update_modal")}
        </h1>
        <div
          className={`mt-4 transition-all duration-300 ${
            isSelectOpen ? "min-h-[250px]" : "min-h-[100px]"
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

export default StatusUpdateModal;
