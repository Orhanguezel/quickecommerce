import { AppModal } from "@/components/blocks/common/AppModal";
import { Card } from "@/components/ui";
import { useDeliverymanStatusUpdate } from "@/modules/admin-section/deliveryman/deliveryman.action";
import React, { useState } from "react";
import { toast } from "react-toastify";

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
    row?.user?.status == 1 ? "Active" : "Inactive"
  );

  const { mutate: updateStoreStatus } = useDeliverymanStatusUpdate();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    setLoading(true);
    const statusCode = selectedStatus === "Active" ? 1 : 0;
    const defaultData = {
      deliveryman_ids: [row.user_id],
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
          toast.error(
            error instanceof Error
              ? `Error refetching data: ${error.message}`
              : "An unknown error occurred while refetching data"
          );
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
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-blue-500">Status Update Modal</h1>
        <Card className="p-2 md:p-6 mt-4">
          <p className="text-gray-500 dark:text-white my-2">
            Select a status and confirm
          </p>
          <div className="flex flex-col gap-2 items-start">
            {["Active", "Inactive"].map((status) => (
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
        </Card>
      </div>
    </AppModal>
  );
};

export default StatusUpdateModal;
