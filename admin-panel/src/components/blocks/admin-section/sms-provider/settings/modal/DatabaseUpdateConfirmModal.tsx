import AlertIcon from "@/assets/icons/AlertIcon";
import { AppModal } from "@/components/blocks/common/AppModal";
import { AlertCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface ConfirmationModalProps {
  trigger: any;
  loading?: boolean;
  title?: string;
  subTitle?: string;
  onSave?: () => void;
}

const DatabaseUpdateConfirmModal: React.FC<ConfirmationModalProps> = ({
  onSave,
  trigger,
  loading,
  title = "Database Update",
  subTitle,
}) => {
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
      actionButtonLabel="Yes"
      customClass="inset-x-0 md:inset-x-35p top-[200px]"
      onSave={() => handleSave()}
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
      smallModal
    >
      <p className="text-yellow-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 20h.01M12 4h.01M4 12h.01M20 12h.01M6.34 6.34h.01M17.66 17.66h.01M6.34 17.66h.01M17.66 6.34h.01"
          />
        </svg>
      </p>
      <div className="flex flex-col items-start justify-start p-2">
        <h1 className="text-2xl font-semibold text-[#102A43] dark:text-white mb-2">{title}</h1>
        <p className="text-sm  text-gray-500 dark:text-white text-start">
          {subTitle}
        </p>
      </div>
    </AppModal>
  );
};

export default DatabaseUpdateConfirmModal;
