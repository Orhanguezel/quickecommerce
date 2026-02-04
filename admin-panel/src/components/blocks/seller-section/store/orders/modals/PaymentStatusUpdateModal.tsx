import { AppModal } from "@/components/blocks/common/AppModal";
import { Card } from "@/components/ui";
import {
  useOrdersPaymentStatusUpdate
} from "@/modules/admin-section/orders/orders.action";
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
  const [selectedStatus, setSelectedStatus] = useState(row.payment_status);
  const { mutate: updateStoreStatus } = useOrdersPaymentStatusUpdate();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      order_id: row.id,
      status: selectedStatus,
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
      isOpen={isModalOpen} // Bind modal open state
      onOpenChange={setIsModalOpen}
      smallModal
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-blue-500 mb-4">
          {t("common.payment_status_update_modal")}
        </h1>
        <Card className="p-4 ">
          <p className="text-gray-500 dark:text-white my-2">
            {t("common.select_payment_status_and_confirm")}
          </p>
          <div className="flex flex-col gap-2 items-start">
            {["paid", "pending", "failed"].map((status) => (
              <label key={status} className="px-2 flex items-center space-x-2">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={() => handleStatusChange(status)}
                  className="form-radio text-blue-500"
                />
                <p className="capitalize cursor-pointer text-sm text-blue-500 font-semibold hover:text-opacity-80 w-full">
                  {status}
                </p>
              </label>
            ))}
          </div>
        </Card>
      </div>
    </AppModal>
  );
};

export default PaymentStatusUpdateModal;
