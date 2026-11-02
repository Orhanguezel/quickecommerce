import { AppModal } from "@/components/blocks/common/AppModal";
import { Textarea } from "@/components/ui";
import { useQuestionsReply } from "@/modules/admin-section/feedback-control/questions/questions.action";
import { MessageCircleQuestion, MessageSquareQuote } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface ShowReplyModalProps {
  trigger: React.ReactNode;
  row: { id: string; question: string; reply?: string | null };
  refetch: () => void;
}

const ShowReplyModal: React.FC<ShowReplyModalProps> = ({ trigger, row, refetch }) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [reply, setReply] = useState(row.reply || "");
  const { mutate, isPending } = useQuestionsReply();

  const handleOpenChange = (open: boolean) => {
    if (isPending) return;
    setIsOpen(open);
    if (open) setReply(row.reply || "");
  };

  const handleSave = () => {
    const value = reply.trim();
    if (!value) return;
    mutate(
      { question_id: Number(row.id), reply: value },
      {
        onSuccess: () => {
          refetch();
          setIsOpen(false);
        },
      }
    );
  };

  return (
    <AppModal
      trigger={trigger}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[200px] md:top-[200px] top-[100px]"
      cancelButtonLabel={t("button.close")}
      disable={isPending || !reply.trim()}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      IsLoading={isPending}
      onSave={handleSave}
      actionButtonLabel={t("button.reply")}
    >
      <MessageSquareQuote className="text-gray-500 dark:text-white" width={40} height={40} />
      <div className="flex flex-col items-start justify-start p-2 w-full">
        <div className="flex items-center gap-1 text-lg font-semibold text-red-500 my-2">
          <MessageCircleQuestion width={20} height={20} />
          <span>{row.question}</span>
        </div>
        <Textarea
          aria-label={t("button.reply")}
          placeholder={t("common.write_reply")}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          maxLength={1000}
          className="app-input"
        />
      </div>
    </AppModal>
  );
};

export default ShowReplyModal;
