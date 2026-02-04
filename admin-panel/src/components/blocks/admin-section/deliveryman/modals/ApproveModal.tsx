import { AppModal } from "@/components/blocks/common/AppModal";
import GlobalImageLoader from "@/lib/imageLoader";
import { useDeliverymanVerifyUpdate } from "@/modules/admin-section/deliveryman/deliveryman.action";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}

const ApproveModal: React.FC<StatusUpdateModalProps> = ({
  trigger,
  refetch,
  row,
}) => {
  const t = useTranslations();
  const { mutate: updateStoreStatus } = useDeliverymanVerifyUpdate();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    setLoading(true);
    const defaultData = {
      id: row.id,
      status: "1",
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
      actionButtonLabel="Approve"
      IsLoading={loading}
      onSave={handleSave}
      customClass="inset-x-10p md:inset-x-38p top-[200px] md:top-[250px]"
      isOpen={isModalOpen} // Bind modal open state
      onOpenChange={setIsModalOpen}
    >
      <div className="text-start ">
        <h1 className="text-2xl font-semibold text-blue-500 my-4">
          Verify Deliveryman
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
          <div className="">
            <p className="text-sm font-semibold text-gray-500 mb-2">
              Front Image
            </p>
            <a
              href={row?.identification_photo_front_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md relative group"
            >
              <div className="w-32 h-32 mb-2 border p-1 rounded-md relative group">
                <Image
                  loader={GlobalImageLoader}
                  src={row?.identification_photo_front_url}
                  alt="Uploaded"
                  fill
                  sizes="128px"
                  className="h-full w-full rounded-md"
                />
                <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
                  <p className="text-sm font-bold text-blue-500 p-1">Preview</p>
                </div>
              </div>
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">
              Back Image
            </p>
            <a
              href={row?.identification_photo_back_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md relative group"
            >
              <div className="w-32 h-32 mb-2 border p-1 rounded-md relative group">
                <Image
                  loader={GlobalImageLoader}
                  src={row?.identification_photo_back_url}
                  alt="Uploaded"
                  fill
                  sizes="128px"
                  className="h-full w-full rounded-md"
                />
                <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
                  <p className="text-sm font-bold text-blue-500 p-1">Preview</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ApproveModal;
