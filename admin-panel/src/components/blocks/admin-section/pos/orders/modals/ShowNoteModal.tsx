import { AppModal } from "@/components/blocks/common/AppModal";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface ShowNoteModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}

const ShowNoteModal: React.FC<ShowNoteModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <AppModal
      trigger={trigger}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[200px] md:top-[200px] top-[100px]"
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      cancelButtonLabel={t("button.close")}
    >
      <div className="text-start ">
        <h1 className="text-xl font-bold flex gap-1 items-center  border-b border-slate-300 pt-2 pb-4">
          <div className="mx-1 text-blue-500 bg-blue-100 rounded p-1">
            <Info width={16} height={16} />
          </div>
          Notes
        </h1>
        <div className="mt-4 ">
          <h2 className="text-lg font-semibold">Store Note: </h2>
          <div className="max-h-40 overflow-auto break-words custom-scrollbar p-1 text-sm">
            {row?.reject_reason}
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Customer Note: </h2>
          <div className="max-h-40 overflow-auto break-words custom-scrollbar p-1 text-sm">
            {row?.customer_note}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ShowNoteModal;
