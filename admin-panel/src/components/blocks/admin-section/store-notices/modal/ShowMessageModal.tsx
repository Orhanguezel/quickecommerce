import { AppModal } from "@/components/blocks/common/AppModal";
import { MessageSquareQuote } from "lucide-react";
import React, { useState } from "react";

interface ShowReplyModalProps {
  trigger: any;
  loading?: boolean;
  question?: string;
  reply?: string;
  onSave?: () => void;
}

const ShowMessageModal: React.FC<ShowReplyModalProps> = ({
  trigger,
  loading,
  question = "Are You Sure ? ",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppModal
      trigger={trigger}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[200px] md:top-[200px] top-[100px]"
      cancelButtonLabel="Close"
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
    >
      <p className="pt-2 text-gray-500 dark:text-white">
        <MessageSquareQuote width={40} height={40} />
      </p>
      <div className=" flex flex-col items-start justify-start p-2 w-full">
        <div className=" my-2">
          <span>{question}</span>
        </div>
      </div>
    </AppModal>
  );
};

export default ShowMessageModal;
