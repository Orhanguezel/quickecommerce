import { AppModal } from "@/components/blocks/common/AppModal";
import { useStoreStatusUpdateMutation } from "@/modules/admin-section/store/store.action";
import React, { useState } from "react";
import { Button, Card } from "@/components/ui";
import { useOrdersStatusUpdate } from "@/modules/admin-section/orders/orders.action";
import { useTranslations } from "next-intl";
import { useSupportTicketPriorityChange } from "@/modules/seller-section/support-ticket/support-ticket.action";
import { AppSelect } from "@/components/blocks/common";
import { toast } from "react-toastify";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}
const priorityList = [
  { label: "Urgent", value: "urgent" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const { mutate: updateStoreStatus } = useSupportTicketPriorityChange();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectDeliveryman, setSelectDeliveryman] = useState<string>(
    row?.priority
  );
  const handleDeliveryman = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectDeliveryman("");
    } else {
      setSelectDeliveryman(newSelectOwner);
    }
  };

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      ticket_id: row.id,
      priority: selectDeliveryman,
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
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[200px] md:top-[200px] top-[100px]"
      isOpen={isModalOpen} // Bind modal open state
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold text-blue-500">
          Priority Update Modal
        </h1>

        <Card className="p-4 my-4 min-h-[280px]">
          <p className="text-gray-500 dark:text-white mb-2">
            Select Priority and Confirm
          </p>

          <AppSelect
            placeholder={t("place_holder.select_deliveryman")}
            value={String(selectDeliveryman)}
            onSelect={handleDeliveryman}
            groups={priorityList}
          />
        </Card>
      </div>
    </AppModal>
  );
};

export default StatusUpdateModal;
