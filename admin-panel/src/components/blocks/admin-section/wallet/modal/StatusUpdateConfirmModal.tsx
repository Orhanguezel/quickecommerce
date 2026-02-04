import { AppModal } from "@/components/blocks/common/AppModal";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  loading?: boolean;
  subTitle?: string;
  onSave?: () => void;
}

const StatusUpdateConfirmModal: React.FC<StatusUpdateModalProps> = ({
  onSave,
  trigger,
  loading,
  subTitle,
}) => {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSave = () => {
    if (onSave) {
      onSave();
      setIsModalOpen(false);
    } else {
    }
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("button.confirm")}
      IsLoading={loading}
      customClass="inset-x-40p top-[150px] md:top-[200px] lg:top-[200px]"
      onSave={() => handleSave()}
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
    >
      <div>
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-red-500 mb-2">
            {t("common.are_you_sure")}
          </h1>
          <p className="text-gray-500 dark:text-white my-2">{subTitle}</p>
        </div>
      </div>
    </AppModal>
  );
};

export default StatusUpdateConfirmModal;
