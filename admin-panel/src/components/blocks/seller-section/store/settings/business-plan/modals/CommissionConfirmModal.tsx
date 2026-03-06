import { AppModal } from "@/components/blocks/common/AppModal";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface PaymentMethodModalProps {
  onSave?: () => void;
  trigger: any;
  isConfirm: any;
}

const CommissionConfirmModal: React.FC<PaymentMethodModalProps> = ({
  onSave,
  trigger,
  isConfirm
}) => {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      
    }
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("button.confirm")}
      customClass="inset-x-0 md:inset-x-20p xl:inset-x-35p lg:top-[310px] md:top-[310px] top-[200px]"
      onSave={()=> handleSave()}
      isOpen={isModalOpen} // Bind modal open state
      onOpenChange={setIsModalOpen} 
      IsLoading={isConfirm}
      disable= {isConfirm}
    >
      <div>
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-red-500 mb-2">
            {t("common.are_you_sure")}
          </h1>
          <p className="text-gray-500 dark:text-white my-2">
            {t("common.confirm_switch_subscription_to_commission")}
          </p>
          <div className="flex xl:flex-row lg:flex-col md:flex-col items-center justify-center gap-4 mt-2 mb-8 text-xl">
            <span className="bg-blue-50 text-blue-500 font-semibold px-2  rounded">
              {t("table_header.subscription")}
            </span>
            <span className="">
              {" "}
              <ArrowRightIcon height={16} />{" "}
            </span>
            <span className="bg-blue-50 text-blue-500 font-semibold px-2  rounded">
              {t("common.commission")}
            </span>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default CommissionConfirmModal;
