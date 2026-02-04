import { AppModal } from "@/components/blocks/common/AppModal";
import { ArrowRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
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
      actionButtonLabel="Confirm"
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
            Are You Sure ?
          </h1>
          <p className="text-gray-500 dark:text-white my-2">
            Confirm to Switch from Subscription to Commission!
          </p>
          <div className="flex xl:flex-row lg:flex-col md:flex-col items-center justify-center gap-4 mt-2 mb-8 text-xl">
            <span className="bg-blue-50 text-blue-500 font-semibold px-2  rounded">
              Subscription{" "}
            </span>
            <span className="">
              {" "}
              <ArrowRightIcon height={16} />{" "}
            </span>
            <span className="bg-blue-50 text-blue-500 font-semibold px-2  rounded">
              {" "}
              Commission
            </span>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default CommissionConfirmModal;
