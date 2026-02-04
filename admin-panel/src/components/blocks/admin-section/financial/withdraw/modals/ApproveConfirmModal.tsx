import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { AppModal } from "@/components/blocks/common/AppModal";
import { Textarea } from "@/components/ui";
import {
  useFileUploadService,
  useRequestApproveMutation,
} from "@/modules/admin-section/financial/withdraw/request/request.action";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface ApproveConfirmModalProps {
  trigger: any;
  refetch: () => void;
  ID: any;
}

const ApproveConfirmModal: React.FC<ApproveConfirmModalProps> = ({
  trigger,
  refetch,
  ID,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { mutate: ApproveSingleRowId } = useRequestApproveMutation();
  const { uploadFile } = useFileUploadService();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "application/zip",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          "Invalid file type! Please upload jpg, png, jpeg, webp, zip, or pdf."
        );
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const defaultData = {
      id: ID,
      attachment: "",
    };
    const submissionData = {
      id: ID,
      attachment: selectedFile,
    };
    if (selectedFile) {
      try {
        // Pass the message, ticket_id, and file to the uploadFile function
        const response = await uploadFile(
          selectedFile,
          submissionData.id,
          API_ENDPOINTS.WITHDRAW_REQUEST_APPROVE
        );
        toast.success(response?.message);
        setSelectedFile(null);
        setLoading(false);
        setIsModalOpen(false);
        await refetch();
      } catch (error) {
        toast.error(
          "File upload failed. Please check the file type or try again."
        );
        setLoading(false);
      }
    } else {
      return ApproveSingleRowId(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            setSelectedFile(null);
            setLoading(false);
            setIsModalOpen(false);
            refetch();
          },
          onError: () => {
            setLoading(false);
          },
        }
      );
    }
  };

  return (
    <AppModal
      trigger={trigger}
      actionButtonLabel={t("button.approve")}
      customClass="inset-x-0 md:inset-x-20p lg:inset-x-30p xl:inset-x-35p top-[200px] "
      onSave={() => handleSave()}
      disable={loading}
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      IsLoading={loading}
    >
      <div className="px-2 ">
        <h1 className="text-base md:text-xl font-bold text-gray-500 dark:text-white mb-4 mt-6 md:mt-0">
          {t("common.approve_withdrawal_request")}
        </h1>
        <div className="border-t border-slate-300 py-4">
          <p className="text-sm font-medium">
             {t("common.upload_receipt_for_confirm_payment")}
          </p>
          <input
            type="file"
            accept=".jpg,.png,.jpeg,.webp,.zip,.pdf"
            className="my-4 "
            id="fileUpload"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </AppModal>
  );
};

export default ApproveConfirmModal;
