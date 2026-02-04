import Loader from "@/components/molecules/Loader";
import { AppModal } from "@/components/blocks/common/AppModal";
import { useNoticeDetailsQuery } from "@/modules/seller-section/settings/notices/notices.action";
import { MessageSquareWarning } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface ShowReplyModalProps {
  trigger: any;
  loading?: boolean;
  title?: string;
  subTitle?: string;
  onSave?: () => void;
  InvoiceList?: any;
  RowId?: any;
}

const ShowReplyModal: React.FC<ShowReplyModalProps> = ({
  onSave,
  trigger,
  loading,
  RowId,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { NoticeDetails, isPending } = useNoticeDetailsQuery({
    language: locale,
    id: RowId,
  });
  const NoticeDetailsData = NoticeDetails as any;

  return (
    <AppModal
      trigger={trigger}
      customClass="lg:inset-x-35p md:inset-x-35p lg:top-[100px] md:top-[100px] top-[50px]"
      cancelButtonLabel=""
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
      actionButtonLabel=""
    >
      <p className="pt-2 text-gray-500 dark:text-white">
        <MessageSquareWarning width={40} height={40} />
      </p>
      <div className="p-2 w-full">
        {isPending ? (
          <div className="flex items-center justify-center gap-1 my-2 w-full">
            <Loader customClass="mt-10" size="large" />
          </div>
        ) : (
          <div className="flex items-start gap-1 my-2 ">
            <div className="max-h-[300px] overflow-auto custom-scrollbar ">
              {NoticeDetailsData?.title && (
                <>
                  <h1 className="text-lg font-semibold">{t("label.title")}</h1>
                  <p className="text-sm font-normal text-gray-500 dark:text-white">
                    {NoticeDetailsData?.title}
                  </p>
                </>
              )}
              {NoticeDetailsData?.message && (
                <>
                  <h1 className="text-lg font-semibold mt-4">{t("label.message")}</h1>
                  <p className="text-sm font-normal text-gray-500 dark:text-white">
                    {NoticeDetailsData?.message}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default ShowReplyModal;
