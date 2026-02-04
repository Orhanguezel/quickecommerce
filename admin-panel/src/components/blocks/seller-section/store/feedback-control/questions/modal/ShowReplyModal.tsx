import { AppModal } from "@/components/blocks/common/AppModal";
import { Textarea } from "@/components/ui";
import { useQuestionsReply } from "@/modules/seller-section/feedback-control/questions/questions.action";
import {
  MessageCircleQuestion,
  MessageSquareQuote
} from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
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

  const { mutate: updateStoreStatus } = useQuestionsReply();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      question_id: row?.id,
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
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[200px] md:top-[200px] top-[100px]"
      cancelButtonLabel={t("button.close")}
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
      onSave={handleSave}
      actionButtonLabel={t("button.reply")}
    >
      <p className="pt-2 text-gray-500 dark:text-white">
        <MessageSquareQuote width={40} height={40} />
      </p>
      <div className=" flex flex-col items-start justify-start p-2 w-full">
        <div className="flex items-center gap-1 text-lg font-semibold text-red-500 my-2">
          <span>
            <MessageCircleQuestion width={20} height={20} />
          </span>
          <span>{row?.question}</span>
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
