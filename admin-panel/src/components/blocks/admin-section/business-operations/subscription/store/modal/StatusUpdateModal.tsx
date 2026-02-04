import { AppModal } from "@/components/blocks/common/AppModal";
import { useSubscriptionStoreStatusChange } from "@/modules/admin-section/business-operations/subscription/package/package.action";
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
  const t = useTranslations();
  const [selectedStatus, setSelectedStatus] = useState(
    row?.status == 1
      ? t("common.active")
      : row?.status == 2
      ? t("common.cancelled")
      : t("common.pending")
  );

  const { mutate: updateStoreStatus } = useSubscriptionStoreStatusChange();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    setLoading(true);
    const statusCode =
      selectedStatus === "Active" ? 1 : selectedStatus === "Cancelled" ? 2 : 0;
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
      actionButtonLabel="Confirm"
      IsLoading={loading}
      onSave={handleSave}
      customClass="lg:inset-x-40p md:inset-x-40p lg:top-[250px] md:top-[250px] top-[200px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-blue-500">
          {t("common.status_update")}{" "}
        </h1>
        <div className="p-2 md:p-6 mt-4">
          <p className="text-gray-500 dark:text-white my-2">
            {t("common.select_a_status_and_confirm")}
          </p>
          <div className="flex flex-col gap-2 items-start">
            {["Active", "Pending", "Cancelled"].map((status) => (
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
