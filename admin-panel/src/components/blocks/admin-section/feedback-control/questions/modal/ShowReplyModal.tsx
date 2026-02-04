import { AppModal } from "@/components/blocks/common/AppModal";
import { Card } from "@/components/ui";
import { MessageCircleQuestion, MessageSquareQuote } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface ShowReplyModalProps {
  trigger: any;
  loading?: boolean;
  question?: string;
  reply?: string;
  onSave?: () => void;
}

const ShowReplyModal: React.FC<ShowReplyModalProps> = ({
  onSave,
  trigger,
  loading,
  question = "Are You Sure ? ",
  reply,
}) => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
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
        <div className="flex items-center gap-1 text-lg font-semibold text-red-500 my-2">
          <span>
            <MessageCircleQuestion width={20} height={20} />
          </span>
          <span>{question}</span>
        </div>
        {reply ? (
          <Card className="w-full py-2 px-4 max-h-[200px] overflow-y-auto custom-scrollbar text-sm font-semibold text-blue-500 text-justify">
            “{reply}”
          </Card>
        ) : (
          "No replies yet!"
        )}
      </div>
    </AppModal>
  );
};

export default ShowReplyModal;
