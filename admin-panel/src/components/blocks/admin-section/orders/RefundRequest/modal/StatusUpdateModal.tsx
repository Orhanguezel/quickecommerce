import { AppSelect } from "@/components/blocks/common";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Card, Textarea } from "@/components/ui";
import { useRefundRequestStatusUpdate } from "@/modules/admin-section/orders/refund-request/refund-request.action";
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
  const { mutate: updateStoreStatus } = useRefundRequestStatusUpdate();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(row?.reject_reason);
  const [selectStatus, setSelectStatus] = useState<string>(row?.status);
  const statusList =
    row?.status === "approved"
      ? [{ label: "Refunded", value: "refunded" }]
      : [
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Refunded", value: "refunded" },
        ];

  const handleStatusChange = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectOwner);
    }
  };
  const handleRejectReason = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setRejectReason(value);
  };

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      id: row.id,
      status: selectStatus,
      reject_reason: rejectReason,
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
      customClass="inset-x-35p top-[150px] md:top-[200px] lg:top-[200px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      disable={loading || (selectStatus === "rejected" && rejectReason === "")}
    >
      <div className="text-start ">
        <h1 className="text-2xl font-semibold text-blue-500">
          {t("common.status_update_modal")}
        </h1>

        <div
          className={`mt-4 transition-all duration-200 ${
            isSelectOpen ? "min-h-[220px]" : "min-h-[100px]"
          }`}
        >
          <p className="text-sm font-semibold text-gray-500 dark:text-white mb-2">
            {t("common.select_status_and_confirm")}
          </p>

          <AppSelect
            placeholder={t("place_holder.select_status")}
            value={String(selectStatus)}
            onSelect={handleStatusChange}
            groups={statusList}
            hideNone
            onOpenChange={setIsSelectOpen}
          />
          {selectStatus === "rejected" && (
            <div className="my-2">
              <p className="text-sm font-medium mb-1">{t("label.reason")}</p>
              <Textarea
                id="reject_reason"
                defaultValue={rejectReason ? rejectReason : ""}
                className="app-input"
                placeholder={t("place_holder.enter_reject_reason")}
                onChange={(e) => {
                  handleRejectReason(e);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default StatusUpdateModal;
