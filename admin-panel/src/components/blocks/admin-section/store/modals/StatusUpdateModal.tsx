import { AppModal } from "@/components/blocks/common/AppModal";
import { useStoreStatusUpdateMutation } from "@/modules/admin-section/store/store.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(
    row.status == 1 ? "Active" : row.status == 2 ? "Inactive" : "Pending"
  );
  const t = useTranslations();
  const { mutate: updateStoreStatus } = useStoreStatusUpdateMutation();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    setLoading(true);
    const statusCode =
      selectedStatus == "Active" ? 1 : selectedStatus == "Inactive" ? 2 : 0;
    const defaultData = {
      id: row.id,
      status: statusCode,
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
    >
      <div className="text-start ">
        <h1 className="text-2xl font-semibold text-blue-500">{t("common.status_update")} </h1>
        <div className="p-2 md:p-6 ">
          <p className="text-gray-500 dark:text-white my-2">{t("common.select_and_confirm")}</p>
          <div className="flex flex-col gap-2 items-start">
            {["Active", "Inactive", "Pending"].map((status) => (
              <label key={status} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={() => handleStatusChange(status)}
                  className="form-radio text-blue-500"
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default StatusUpdateModal;
