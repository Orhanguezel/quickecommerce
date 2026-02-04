"use client";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Button, Card, CardContent, Textarea } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import { useReplyMessageMutation } from "@/modules/admin-section/support-ticket/support-ticket.action";
import {
  SupportTicketFormData2,
  supportTicketSchema2,
} from "@/modules/admin-section/support-ticket/support-ticket.schema";
import { useFileUploadService } from "@/modules/admin-section/support-ticket/support-ticket.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCheck, Paperclip, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const SupportTicketDetailsCard = ({ data, ID, refetch }: any) => {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<SupportTicketFormData2>({
    resolver: zodResolver(supportTicketSchema2),
  });
  const checkedValue = watch();

  const { ticket_details = {}, sender_details: SenderDetails = {} } =
    data.length > 0 ? data[0] : {};

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [data]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream",
        "application/pdf",
      ];
      const allowedExtensions = ["jpg", "jpeg", "png", "webp", "zip", "pdf"];
      if (
        !allowedTypes.includes(file.type) &&
        !(fileExtension && allowedExtensions.includes(fileExtension))
      ) {
        alert(
          "Invalid file type! Please upload jpg, png, jpeg, webp, zip, or pdf."
        );
        return;
      }

      setSelectedFile(file);
      setValue("file", file);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: blogCategoryUpdate, isPending: isMessaging } =
    useReplyMessageMutation();
  const { uploadFile } = useFileUploadService();
  const onSubmit = async (values: SupportTicketFormData2) => {
    const submissionData = {
      message: values.message,
      ticket_id: ID,
      file: selectedFile,
    };
    if (!values.message && !selectedFile) {
      return toast.error("Please provide a message or attach a file.");
    }

    if (selectedFile) {
      setIsSubmitting(true);
      try {
        // Pass the message, ticket_id, and file to the uploadFile function
        const response = await uploadFile(
          selectedFile,
          submissionData.message,
          submissionData.ticket_id,
          API_ENDPOINTS.SUPPORT_TICKET_REPLY_MESSAGE
        );
        toast.success(response?.message);
        setValue("message", ""); // Clear the input field
        setSelectedFile(null);
        await refetch();
      } catch (error) {
        toast.error(
          "File upload failed. Please check the file type or try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      return blogCategoryUpdate(
        { ...(submissionData as any) },
        {
          onSuccess: () => {
            setValue("message", ""); // Clear the input field
            setSelectedFile(null);
            refetch();
          },
        }
      );
    }
  };

  type SubmitButtonProps = {
    AddLabel: string;
    isLoading?: boolean;
  };

  const SubmitButton = ({ AddLabel, isLoading }: SubmitButtonProps) => {
    return (
      <Button
        type="submit"
        disabled={
          isLoading ||
          (!checkedValue.message && !selectedFile) ||
          data.length == 0 ||
          ticket_details?.status == 0
        }
        className="px-4 py-2 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Sending...
          </span>
        ) : (
          AddLabel
        )}
      </Button>
    );
  };

  return (
    <>
      <div className="grid 2xl:grid-cols-3 grid-cols-1 gap-4">
        <div className="2xl:col-span-2">
          <Card>
            <CardContent className="p-2 md:p-6 w-full">
              <div className="flex items-start justify-between border-b border-slate-400 pb-4">
                <div className="flex items-center gap-2">
                  <div className="relative w-[40px] h-[40px] ">
                    <Image
                      loader={GlobalImageLoader}
                      src={SenderDetails?.image_url ?? "/images/no-image.png"}
                      alt="Avatar"
                      fill
                      sizes="160px"
                      className="w-full h-full rounded-full"
                    />
                    <div className="absolute bottom-0 right-0 rounded-full bg-white p-0.5 shadow-xl">
                      <div className="bg-gray-500 rounded-full w-[8px] h-[8px]" />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-md font-bold ">
                      {SenderDetails?.name}
                    </h1>
                  </div>
                </div>
              </div>
              <div
                ref={messagesContainerRef}
                className="overflow-y-auto max-h-[500px] custom-scrollbar bg-[#F5F5F5] dark:bg-gray-900 p-2"
              >
                {Array.isArray(data) && data.length > 0
                  ? data?.map((singleMessage, index) => {
                      const {
                        sender_details = {},
                        receiver_details = {},
                        message = {},
                      } = singleMessage;
                      const fileName = message?.file
                        ? message.file.split("/").pop()
                        : null;

                      return (
                        <div
                          key={index}
                          className="mt-4 flex items-start justify-between"
                        >
                          <div className="flex items-end gap-2">
                            {message?.role === "customer_level" && (
                              <>
                                <div className="relative w-[40px] h-[40px] ">
                                  <Image
                                    loader={GlobalImageLoader}
                                    src={sender_details?.image_url ?? "/images/no-image.png"}
                                    alt="Avatar"
                                    fill
                                    sizes="160px"
                                    className="w-full h-full rounded-full"
                                  />
                                  <div className="absolute bottom-0 right-0 rounded-full bg-white p-0.5 shadow-xl">
                                    <div className="bg-gray-500 rounded-full w-[8px] h-[8px]" />
                                  </div>
                                </div>
                                <div>
                                  <div className="bg-white text-gray-800 mb-1 rounded-t-lg rounded-br-lg p-2 max-w-[300px]">
                                    <span className="flex items-center text-sm">
                                      {message?.message}
                                    </span>
                                    <div>
                                      {message.file &&
                                        (() => {
                                          const fileUrl = String(message.file);
                                          const fileExtension = fileUrl
                                            .split(".")
                                            .pop()
                                            ?.toLowerCase();

                                          if (
                                            [
                                              "jpg",
                                              "jpeg",
                                              "png",
                                              "gif",
                                              "webp",
                                            ].includes(fileExtension!)
                                          ) {
                                            return (
                                              <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mb-2"
                                              >
                                                <Image
                                                  loader={GlobalImageLoader}
                                                  src={fileUrl}
                                                  alt="Uploaded"
                                                  width={200}
                                                  height={200}
                                                  className="rounded-md"
                                                />
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
                                                📄 View PDF
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
                                        })()}{" "}
                                    </div>
                                  </div>
                                  <p className="text-xs flex items-center justify-end gap-1">
                                    {message?.timestamp}
                                  </p>
                                </div>
                              </>
                            )}
                            {message?.role === "store_level" && (
                              <>
                                <div className="relative w-[40px] h-[40px] ">
                                  <Image
                                    loader={GlobalImageLoader}
                                    src={sender_details?.image_url ?? "/images/no-image.png"}
                                    alt="Avatar"
                                    fill
                                    sizes="160px"
                                    className="w-full h-full rounded-full"
                                  />
                                  <div className="absolute bottom-0 right-0 rounded-full bg-white p-0.5 shadow-xl">
                                    <div className="bg-gray-500 rounded-full w-[8px] h-[8px]" />
                                  </div>
                                </div>
                                <div>
                                  <div className="bg-white text-gray-800 mb-1 rounded-t-lg rounded-br-lg p-2 max-w-[300px]">
                                    <span className="flex items-center text-sm">
                                      {message?.message}
                                    </span>
                                    <div>
                                      {message.file &&
                                        (() => {
                                          const fileUrl = String(message.file);
                                          const fileExtension = fileUrl
                                            .split(".")
                                            .pop()
                                            ?.toLowerCase();

                                          if (
                                            [
                                              "jpg",
                                              "jpeg",
                                              "png",
                                              "gif",
                                              "webp",
                                            ].includes(fileExtension!)
                                          ) {
                                            return (
                                              <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mb-2"
                                              >
                                                <Image
                                                  loader={GlobalImageLoader}
                                                  src={fileUrl}
                                                  alt="Uploaded"
                                                  width={200}
                                                  height={200}
                                                  className="rounded-md"
                                                />
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
                                                📄 View PDF
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
                                  </div>
                                  <p className="text-xs flex items-center justify-end gap-1">
                                    {message?.timestamp}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-end gap-2">
                            {message?.role === "system_level" && (
                              <>
                                <div>
                                  <div className="bg-blue-500 text-white mb-1 rounded-t-lg rounded-bl-lg p-2 max-w-[300px]">
                                    <span className="flex items-center text-sm">
                                      {message?.message}
                                    </span>
                                    <div>
                                      {message.file &&
                                        (() => {
                                          const fileUrl = String(message.file);
                                          const fileExtension = fileUrl
                                            .split(".")
                                            .pop()
                                            ?.toLowerCase();

                                          if (
                                            [
                                              "jpg",
                                              "jpeg",
                                              "png",
                                              "gif",
                                              "webp",
                                            ].includes(fileExtension!)
                                          ) {
                                            return (
                                              <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mb-2"
                                              >
                                                <Image
                                                  loader={GlobalImageLoader}
                                                  src={fileUrl}
                                                  alt="Uploaded"
                                                  width={200}
                                                  height={200}
                                                  className="rounded-md"
                                                />
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
                                                📄 View PDF
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
                                  </div>
                                  <p className="text-xs flex items-center justify-end gap-1">
                                    {message?.timestamp}{" "}
                                    <span className="text-green-500">
                                      {" "}
                                      <CheckCheck width={16} height={16} />{" "}
                                    </span>{" "}
                                  </p>
                                </div>
                                <div className="relative w-[40px] h-[40px] ">
                                  <Image
                                    loader={GlobalImageLoader}
                                    src={receiver_details?.image_url ?? "/images/no-image.png"}
                                    alt="Avatar"
                                    fill
                                    sizes="160px"
                                    className="w-full h-full rounded-full"
                                  />
                                  <div className="absolute bottom-0 right-0 rounded-full bg-white p-0.5 shadow-xl">
                                    <div className="bg-green-500 rounded-full w-[8px] h-[8px]" />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  : ""}
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative my-4">
                  <Textarea
                    id="message"
                    {...register("message")}
                    className="app-input pr-32"
                    placeholder="Enter your message"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(onSubmit)(); 
                      }
                    }}
                  />

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    accept=".jpg,.png,.jpeg,.webp,.zip,.pdf"
                    className="hidden"
                    id="fileUpload"
                    onChange={handleFileChange}
                    disabled={ticket_details?.status == 0}
                  />
                </div>

                <div className=" mt-4 ">
                  {selectedFile && (
                    <div className="mb-4 w-auto">
                      <Card className="flex items-center py-2 px-4 text-sm text-green-600 truncate">
                        <span className="font-semibold">
                          {t("common.attached")}:
                        </span>{" "}
                        <span className="px-2">{selectedFile.name}</span>{" "}
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="bg-red-50 hover:bg-red-500 rounded p-2 text-red-500 hover:text-white"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </Card>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <span
                      className={` flex items-center gap-2  rounded-lg  p-2  ${
                        ticket_details?.status == 0
                          ? "bg-gray-200 text-white cursor-not-allowed"
                          : "bg-gray-400 text-white hover:bg-gray-500 cursor-pointer"
                      }`}
                      onClick={() =>
                        document.getElementById("fileUpload")?.click()
                      }
                    >
                      <span>
                        <Paperclip />
                      </span>
                      <span>{t("common.attach_file")}</span>
                    </span>
                    <SubmitButton
                      AddLabel={t("button.send_message")}
                      isLoading={isMessaging || isSubmitting}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          {data.length > 0 && ticket_details && (
            <Card>
              <CardContent className="p-2 md:p-6 w-full">
                <div className="flex items-start justify-between border-b border-slate-400 pb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-2xl font-medium ">
                      {t("common.support_ticket_details")}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {ticket_details?.priority && (
                      <span
                        className={`border ${
                          ticket_details?.priority === "urgent"
                            ? "text-red-500 border-red-500 bg-red-50"
                            : ticket_details?.priority === "high"
                            ? "text-pink-500 border-pink-500 bg-pink-50"
                            : ticket_details?.priority === "medium"
                            ? "text-yellow-500 border-yellow-500 bg-yellow-50"
                            : "text-green-500 border-green-500 bg-green-50"
                        } capitalize px-2 py-1 rounded`}
                      >
                        {ticket_details?.priority}
                      </span>
                    )}
                    {ticket_details?.status == 0 && (
                      <span
                        className={`border ${
                          ticket_details?.status == 0 &&
                          "text-green-500 border-green-500 bg-green-50"
                        } capitalize px-2 py-1 rounded`}
                      >
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-4">
                      <div className="text-black dark:text-white text-sm font-medium">
                        {t("common.ticket_id")}
                      </div>
                      <div className="col-span-3 text-gray-500 dark:text-white text-sm font-medium flex">
                        <span className="pr-1">:</span>
                        <span className="text-justify">
                          {ticket_details?.ticket_id && "#"}
                          {ticket_details?.ticket_id}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4">
                      <div className="text-black dark:text-white text-sm font-medium">
                        {t("common.title")}
                      </div>
                      <div className="col-span-3 text-gray-500 dark:text-white text-sm font-medium flex">
                        <span className="pr-1">:</span>
                        <span className="text-justify">
                          {ticket_details?.title}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4">
                      <div className="text-black dark:text-white text-sm font-medium">
                        {t("common.subject")}
                      </div>
                      <div className="col-span-3 text-gray-500 dark:text-white text-sm font-medium flex">
                        <span className="pr-1">:</span>
                        <span className="text-justify">
                          {ticket_details?.subject}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default SupportTicketDetailsCard;
