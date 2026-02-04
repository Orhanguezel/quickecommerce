import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { useSupportTicketPriorityChange } from "@/modules/admin-section/support-ticket/support-ticket.action";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

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
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const [selectDeliveryman, setSelectDeliveryman] = useState<string>(row?.priority);
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
      customClass="inset-x-40p top-[150px] md:top-[200px] lg:top-[200px]"
      isOpen={isModalOpen} // Bind modal open state
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-2xl font-semibold text-blue-500 my-4">
          Priority Update
        </h1>

        <div className={`mt-4 transition-all duration-300 ${
            isSelectOpen ? "min-h-[220px]" : "min-h-[100px]"
          }`}>
          <p className="text-gray-500 dark:text-white mb-2">
            Select Priority and Confirm
          </p>

          <AppSelect
            placeholder={t("place_holder.select_deliveryman")}
            value={String(selectDeliveryman)}
            onSelect={handleDeliveryman}
            groups={priorityList}
            hideNone
            onOpenChange={setIsSelectOpen}
          />
        </div>
      </div>
    </AppModal>
  );
};

export default StatusUpdateModal;
