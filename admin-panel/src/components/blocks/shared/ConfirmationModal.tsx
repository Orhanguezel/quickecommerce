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

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  onSave,
  trigger,
  loading,
  title = "Are You Sure ? ",
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
      customClass="lg:inset-x-38p md:inset-x-38p lg:top-[300px] md:top-[300px] top-[200px]"
      onSave={() => handleSave()}
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
      smallModal
    >
      <div className="text-amber-500">
        <AlertIcon />
      </div>
      <div className="flex flex-col items-start justify-start p-2">
        <h1 className="text-2xl font-bold text-[#102A43] dark:text-white mb-2">{title}</h1>
        <p className="text-md font-semibold text-gray-500 dark:text-white text-start">
          {subTitle}
        </p>
      </div>
    </AppModal>
  );
};

export default ConfirmationModal;
