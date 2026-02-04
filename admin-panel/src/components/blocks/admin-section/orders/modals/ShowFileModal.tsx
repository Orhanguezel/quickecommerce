import FileIcon from "@/assets/icons/FileIcon";
import { AppModal } from "@/components/blocks/common/AppModal";
import GlobalImageLoader from "@/lib/imageLoader";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";

interface StatusUpdateModalProps {
  trigger: any;
  refetch: () => void;
  row: any;
}

const ShowFileModal: React.FC<StatusUpdateModalProps> = ({
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
          <FileIcon /> Files
        </h1>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {Array.isArray(row?.files) && row?.files.length > 0 ? (
            row?.files?.map((file: any, index: any) => {
              return (
                <div key={index} className="">
                  {file &&
                    (() => {
                      const fileUrl = String(file);
                      const fileExtension = fileUrl
                        .split(".")
                        .pop()
                        ?.toLowerCase();

                      if (
                        ["jpg", "jpeg", "png", "gif", "webp"].includes(
                          fileExtension!
                        )
                      ) {
                        return (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-md relative group"
                          >
                            <div className="w-24 h-24 mb-2 border p-1 rounded-md relative group">
                              <Image
                                loader={GlobalImageLoader}
                                src={fileUrl}
                                alt="Uploaded"
                                fill
                                sizes="96px"
                                className="h-full w-full rounded-md"
                              />
                              <div className="py-2 absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#FFFFFFE5] border-l border-r border-b w-full rounded-b opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center">
                                <p className="text-sm font-bold text-blue-500 p-1">
                                  Preview
                                </p>
                              </div>
                            </div>
                          </a>
                        );
                      }

                      if (fileExtension === "pdf") {
                        return (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-sm break-words block mt-2"
                          >
                            <div className="flex w-auto text-white bg-red-700 p-1 rounded-md ">
                              {" "}
                              <FileText width={16} height={16} />{" "}
                            </div>{" "}
                            View PDF
                          </a>
                        );
                      }
                      if (fileExtension == "zip") {
                        return (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-sm break-words block mt-2"
                          >
                            ZIP File ({fileExtension})
                          </a>
                        );
                      }
                      return (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-sm break-words block mt-2"
                        >
                          {t("common.loading")}
                        </a>
                      );
                    })()}
                </div>
              );
            })
          ) : (
            <div className="col-span-3 flex items-center justify-center">
              <p>No file attached</p>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default ShowFileModal;
