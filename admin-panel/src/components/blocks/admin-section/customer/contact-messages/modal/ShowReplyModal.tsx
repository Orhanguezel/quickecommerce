import { AppModal } from "@/components/blocks/common/AppModal";
import { Textarea } from "@/components/ui";
import { useContractMessagesReply } from "@/modules/admin-section/customer/contact-messages/contact-messages.action";
import {
  MessageCircle,
  MessageSquareQuote
} from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
interface ShowReplyModalProps {
  trigger: any;
  row: any;
  refetch: () => void;
}
const ShowReplyModal: React.FC<ShowReplyModalProps> = ({
  refetch,
  trigger,
  row,
}) => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(row?.reply);
  const handleSearchInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSearchQuery(e.target.value);
  };

  const { mutate: updateStoreStatus } = useContractMessagesReply();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      id: row?.id,
      reply: searchQuery,
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
      customClass="lg:inset-x-30p md:inset-x-30p lg:top-[100px] md:top-[100px] top-[50px]"
      cancelButtonLabel="Close"
      disable={loading || searchQuery == ""}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
      onSave={handleSave}
      actionButtonLabel="Reply"
    >
      <p className="pt-2 text-gray-500 dark:text-white">
        <MessageSquareQuote width={40} height={40} />
      </p>
      <div className=" flex flex-col items-start justify-start p-2 w-full">
        <div className="flex items-start gap-1 text-blue-500 dark:text-white my-2 ">
          <span>
            <MessageCircle width={20} height={20} />
          </span>
          <div className="max-h-[300px] overflow-auto custom-scrollbar">
            <span>{row?.message}</span>
          </div>
        </div>
        <Textarea
          placeholder="reply..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="app-input"
        />
      </div>
    </AppModal>
  );
};

export default ShowReplyModal;
