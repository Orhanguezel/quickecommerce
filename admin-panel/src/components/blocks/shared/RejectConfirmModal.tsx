import { AppModal } from "@/components/blocks/common/AppModal";
import { Textarea } from "@/components/ui";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface RejectConfirmModalProps {
  trigger: any;
  loading?: boolean;
  subTitle?: string;
  onSave?: (reason: string) => void;
}

const RejectConfirmModal: React.FC<RejectConfirmModalProps> = ({
  onSave,
  trigger,
  loading,
  subTitle,
}) => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleSave = () => {
    if (onSave && rejectReason.trim() !== "") {
      onSave(rejectReason);
      setIsModalOpen(false);
    } else {
    }
  };

  const handleRejectReason = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setRejectReason(value);
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel="Reject"
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[300px] md:top-[300px] top-[200px]"
      onSave={() => handleSave()}
      disable={loading || rejectReason === ""}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold text-amber-500 mb-4">
          Reject Request ?
        </h1>
        <p className="text-sm font-medium mb-1">Enter Reason</p>
        <Textarea
          id="reject_reason"
          defaultValue={rejectReason ? rejectReason : ""}
          className="app-input"
          placeholder="Enter reject reason"
          onChange={(e) => {
            handleRejectReason(e);
          }}
        />
      </div>
    </AppModal>
  );
};

export default RejectConfirmModal;
