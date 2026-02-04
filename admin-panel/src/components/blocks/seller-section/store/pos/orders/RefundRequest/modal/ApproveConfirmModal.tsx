import AlertIcon from "@/assets/icons/AlertIcon";
import { AppModal } from "@/components/blocks/common/AppModal";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface RejectConfirmModalProps {
  trigger: any;
  loading?: boolean;
  title?: string;
  subTitle?: string;
  onSave?: () => void;
}

const ApproveConfirmModal: React.FC<RejectConfirmModalProps> = ({
  onSave,
  trigger,
  loading,
  title,
  subTitle,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
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
      actionButtonLabel={t("button.approve")}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[300px] md:top-[300px] top-[200px]"
      onSave={() => handleSave()}
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
    >
      <p className="text-amber-500">
        <AlertIcon />
      </p>
      <div className="flex flex-col items-start justify-start p-2">
        <h1 className="text-2xl font-bold text-[#102A43] dark:text-white mb-2">{title}</h1>
        <p className="text-md font-semibold text-gray-500 dark:text-white text-start">
          {subTitle}
        </p>
      </div>
    </AppModal>
  );
};

export default ApproveConfirmModal;
