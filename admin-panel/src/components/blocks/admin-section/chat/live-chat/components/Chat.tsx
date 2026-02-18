"use client";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, Input, Textarea } from "@/components/ui";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useChatDetailsQueryById,
  useReplyMessageMutation,
} from "@/modules/admin-section/chat/chat.action";
import { useFileUploadService } from "@/modules/admin-section/chat/chat.service";
import EmojiPicker from "emoji-picker-react";
import { ChevronLeft, Paperclip, Send, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Pusher from "pusher-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
interface Message {
  id?: any;
  sender: string;
  text: string;
  sender_type: string;
  timestamp: string;
  file_url?: string;
  file_type?: "image" | "file";
}
interface PusherMessageData {
  sender: string;
  message: string;
  sender_type: string;
  timestamp: string;
  file_url?: string;
  file_type?: "image" | "file";
}

const userTypes = [
  { label: "All", value: "all" },
  { label: "Store", value: "store" },
  { label: "Delivery Man", value: "deliveryman" },
];

const Chat: React.FC<any> = ({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  originalData,
  refreshList,
  handleLoadMore,
  hasMore,
  isListLoading,
}) => {
  const t = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newReversedData, setNewReversedData] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [activeChannel, setActiveChannel] = useState<string>("");
  const [selectedChatUser, setSelectedChatUser] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [hasMore1, setHasMore1] = useState(true);

  const [selectedUser, setSelectedUser] = useState<{
    sender_id: string;
    receiver_id: string;
    receiver_type: string;
    search?: string;
  } | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const lastListRefreshRef = useRef(0);

  const refreshListSafely = () => {
    const now = Date.now();
    if (now - lastListRefreshRef.current < 1000) return;
    lastListRefreshRef.current = now;
    refreshList?.();
  };

  useEffect(() => {
    const stored = localStorage.getItem("chat_target");
    if (!stored || !originalData?.length) return;

    try {
      const target = JSON.parse(stored);
      const match = originalData.find(
        (user: any) =>
          String(user.user_id) === String(target.receiver_id) &&
          user.user_type === target.receiver_type
      );

      if (match) {
        setSelectedUser({
          sender_id: String(match.sender_id),
          receiver_id: String(match.user_id),
          receiver_type: match.user_type,
          search: "",
        });
        setActiveChannel(String(match.user_id));
        setSelectedChatUser(String(match.chat_id));
      }

      localStorage.removeItem("chat_target");
    } catch (error) {}
  }, [originalData]);

  const currentUser = originalData.find(
    (user: any) => String(user?.user_id) === activeChannel
  );
  const { ChatDetails, refetch, isPending, isFetching } =
    useChatDetailsQueryById({
      receiver_id: selectedUser?.receiver_id,
      receiver_type: selectedUser?.receiver_type,
      search: "",
      page,
    });

  const startIndex = (ChatDetails as any)?.meta?.from;
  const LastPage = (ChatDetails as any)?.meta?.last_page;
  const newData = useMemo(
    () => (ChatDetails as any)?.data || [],
    [ChatDetails]
  );

  useEffect(() => {
    if (!isPending && page > 1) {
      setIsLoading(true);
      refetch();
    }
  }, [page, refetch, isPending]);

  const handleLoadMore1 = () => {
    if (hasMore1 && !isFetching) {
      setIsInitialLoad(false);
      const card = cardRef.current;
      if (card) {
        const scrollTopBefore = card.scrollTop;
        const scrollHeightBefore = card.scrollHeight;

        setPage((prev) => prev + 1);
        setTimeout(() => {
          const scrollHeightAfter = card.scrollHeight;
          card.scrollTop =
            scrollHeightAfter - scrollHeightBefore + scrollTopBefore;
        }, 0);
      }
    }
  };

  const currentPageFromMeta = (ChatDetails as any)?.meta?.current_page;
  useEffect(() => {
    if (!isPending && Array.isArray(newData)) {
      const newData2 = [...newData].reverse();
      setNewReversedData(newData2);
      const formattedMessages = newData2.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender_id,
        text: msg.message,
        sender_type: msg.sender_type,
        timestamp: msg.created_at,
        file_url: msg.file ?? "",
        file_type: msg.file_type ?? "",
      }));

      if (formattedMessages.length) {
        setMessages((prev) => {
          const updatedList = [...formattedMessages, ...prev];
          return Array.from(
            new Map(updatedList.map((item) => [item.id, item])).values()
          );
        });
        if (page == 1 || hasNewMessage) {
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
          setHasNewMessage(false);
        }
        setNextUrl(currentPageFromMeta || null);
      }
      setIsLoading(false);
      setHasMore1(page < LastPage);
    }
  }, [
    newData,
    page,
    ChatDetails,
    currentPageFromMeta,
    isPending,
    LastPage,
    hasNewMessage,
  ]);

  useEffect(() => {
    if (!activeChannel) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      authEndpoint: "/api/pusher",
    });

    const channel = pusher.subscribe(`activeChannel_${currentUser?.sender_id}`);

    channel.bind("new-message", (data: PusherMessageData) => {
      //@ts-ignore
      setMessages((prev) => {
        const exists = prev.some(
          (msg) => msg.text === data.message && msg.timestamp === data.timestamp
        );
        return exists
          ? prev
          : [
              ...prev,
              {
                sender: data.sender,
                text: data.message,
                sender_type: data.sender_type,
                timestamp: data.timestamp,
                file_url: data.file_url ?? "",
                file_type: data.file_type ?? "",
              },
            ];
      });
    });

    return () => {
      channel?.unsubscribe();
      pusher?.disconnect();
    };
  }, [activeChannel, currentUser?.sender_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: messageReply, isPending: isMessaging } =
    useReplyMessageMutation();
  const { uploadFile } = useFileUploadService();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) {
      return "";
    }
    const outgoingTimestamp = new Date().toISOString();
    const submissionData = {
      file: selectedFile,
      message: newMessage,
      chat_id: currentUser?.chat_id,
      sender_id: currentUser?.sender_id,
      receiver_id: selectedUser?.receiver_id ?? "",
      receiver_type: selectedUser?.receiver_type ?? "",
    };
    setIsSubmitting(true);
    try {
      let uploadedFileUrl = "";

      if (selectedFile) {
        const response = await uploadFile(
          selectedFile,
          submissionData.message,
          submissionData.chat_id,
          submissionData.sender_id,
          submissionData.receiver_id,
          submissionData.receiver_type,
          API_ENDPOINTS.REPLY_MESSAGE
        );
        uploadedFileUrl = response?.file_url ?? "";
      } else {
        await new Promise((resolve, reject) => {
          messageReply(
            { ...(submissionData as any) },
            {
              onSuccess: () => resolve(true),
              onError: reject,
            }
          );
        });
      }
      await fetch("/api/pusher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: submissionData.message,
          file_url: uploadedFileUrl,
          sender_type: "admin",
          sender: selectedUser?.sender_id,
          channel: `activeChannel_${currentUser?.sender_id}`,
          timestamp: outgoingTimestamp,
          file_type:
            selectedFile && selectedFile.type.startsWith("image/")
              ? "image"
              : "file",
        }),
      });

      // Show outgoing message immediately without waiting for a hard refresh.
      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            msg.text === (submissionData.message ?? "") &&
            msg.timestamp === outgoingTimestamp
        );
        if (exists) return prev;
        return [
          ...prev,
          {
            id: `local-${Date.now()}`,
            sender: String(submissionData.sender_id ?? ""),
            text: submissionData.message ?? "",
            sender_type: "admin",
            timestamp: outgoingTimestamp,
            file_url: uploadedFileUrl ?? "",
            file_type:
              selectedFile && selectedFile.type.startsWith("image/")
                ? "image"
                : selectedFile
                ? "file"
                : undefined,
          },
        ];
      });

      setNewMessage("");
      setSelectedFile(null);
      setShowEmojiPicker(false);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isEnter = e.key === "Enter";
    const isModifier = e.shiftKey || e.ctrlKey || e.metaKey;

    if (isEnter && !isModifier) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji;
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const updatedText =
        newMessage.slice(0, start) + emoji + newMessage.slice(end);
      setNewMessage(updatedText);

      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-gray-100 ">
      <div
        className={`w-full md:w-1/4 bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-[#1e293b] ${
          showMobileChat ? "hidden" : "block"
        } sm:block`}
      >
        <Card className="p-4 rounded-none">
          <h2 className="text-base xl:text-xl font-semibold">
            {t("common.all_conversation")}
          </h2>
          <div className="mt-2 flex flex-col xl:flex-row items-center gap-2">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={refreshListSafely}
                className="w-full p-2 app-input"
              />
            </div>
            <div className="w-full xl:w-[120px] relative truncate-select">
              <AppSelect
                value={selectedType}
                onSelect={(val: string) => setSelectedType(val)}
                groups={userTypes}
                customClass="w-full xl:w-[120px] !border-gray-300"
                hideNone
              />
            </div>
          </div>
        </Card>
        <div className="p-4" onFocusCapture={refreshListSafely}>
          <h3 className="flex items-center gap-1 font-medium text-gray-500 dark:text-white mb-2">
            <Users width={16} height={16} />
            <span>{t("common.users_list")}</span>
          </h3>
          <div className="flex-1 h-[calc(100vh-21rem)] overflow-y-auto custom-scrollbar">
            {originalData.map((user: any, index: any) => (
              <div
                key={index}
                className={`px-2 py-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-blue-500 ${
                  selectedChatUser === String(user?.chat_id)
                    ? "bg-blue-100 dark:bg-blue-500"
                    : ""
                }`}
                onClick={() => {
                  const clickedUserId = String(user?.user_id);
                  const currentSenderId = String(user.sender_id);
                  setActiveChannel(String(user?.user_id));
                  setSelectedChatUser(String(user?.chat_id));
                  setSelectedUser({
                    sender_id: currentSenderId,
                    receiver_id: clickedUserId,
                    receiver_type: user.user_type,
                    search: "",
                  });
                  setShowMobileChat(true);
                  setNewMessage("");
                  setSelectedFile(null);
                  if (selectedUser?.receiver_id !== clickedUserId) {
                    setMessages([]);
                  }
                }}
              >
                <div className="flex items-center w-full">
                  <div className="relative">
                    <div className="relative w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      {user?.user?.image ? (
                        <Image
                          loader={GlobalImageLoader}
                          src={user?.user?.image}
                          alt="Sender"
                          fill
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 text-sm flex items-center justify-center">
                          {user?.user?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        user?.user?.is_online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div className="ml-3 w-full">
                    <div className="font-medium w-full">
                      <p>{user?.user?.name}</p>
                      <span className="text-xs text-gray-500 dark:text-white capitalize">
                        {user?.user_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="p-4 text-start">
                <span
                  className="cursor-pointer text-gray-500 dark:text-white text-sm font-semibold hover:text-blue-500"
                  onClick={handleLoadMore}
                >
                  {isListLoading ? "Loading..." : "Load More"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {currentUser ? (
        <div
          className={`flex-1 sm:flex flex-col ${
            showMobileChat ? "flex" : "hidden"
          }`}
        >
          <Card className="p-4 flex items-center rounded-none">
            <div className="sm:hidden p-2">
              <button
                onClick={() => setShowMobileChat(false)}
                className="text-blue-500 text-[16px]"
              >
                <ChevronLeft />
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              {currentUser?.user?.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{currentUser?.user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-white">
                {currentUser?.user?.is_online ? "Online" : "Offline"}
              </p>
            </div>
          </Card>
          <Card
            ref={cardRef}
            className="flex-1 overflow-y-auto p-4 rounded-none bg-[#F5F5F5] dark:bg-gray-900"
          >
            {hasMore1 && (
              <div className="p-4 text-center">
                <span
                  className={`cursor-pointer text-gray-500 dark:text-white text-sm font-semibold hover:text-blue-500 ${
                    isFetching ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleLoadMore1}
                >
                  {isFetching ? "Loading..." : "Load More"}
                </span>
              </div>
            )}
            <div>
              {newReversedData?.map((rev, index) => {
                let lastIndex = newReversedData.length - 1;

                return (
                  <span
                    ref={isInitialLoad ? null : bottomRef}
                    key={index}
                    className=""
                  ></span>
                );
              })}
            </div>
            {messages.map((msg, index) => {
              const isSender = msg.sender_type !== "admin";
              const senderInitial = currentUser?.user?.name.charAt(0);

              return (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    isSender ? "justify-start" : "justify-end"
                  }`}
                >
                  {isSender && (
                    <div className="relative flex flex-col justify-end mr-2">
                      <div className="relative w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        {currentUser?.user?.image ? (
                          <Image
                            loader={GlobalImageLoader}
                            src={currentUser?.user?.image}
                            alt="Sender"
                            fill
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 text-sm flex items-center justify-center">
                            {currentUser?.user?.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <div
                      className={`max-w-[276px] md:max-w-[500px] p-3 rounded-lg relative ${
                        isSender
                          ? "bg-white text-gray-800 rounded-bl-none"
                          : "bg-blue-500 text-white rounded-br-none"
                      }`}
                    >
                      <p className="break-words whitespace-normal">
                        {msg.text}
                      </p>
                      {typeof msg.file_url === "string" &&
                        msg.file_url.trim() !== "" &&
                        (() => {
                          const fileUrl = String(msg.file_url);
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
                          return <span>{t("common.loading")}</span>;
                        })()}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        isSender
                          ? "text-gray-500 dark:text-white"
                          : "text-gray-500 dark:text-white text-end"
                      }`}
                    >
                      {(() => {
                        const messageDate = new Date(msg.timestamp);
                        const today = new Date();
                        const bdToday = new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          today.getDate()
                        );

                        const bdMsgDate = new Date(
                          messageDate.getFullYear(),
                          messageDate.getMonth(),
                          messageDate.getDate()
                        );

                        const isToday =
                          bdMsgDate.getTime() === bdToday.getTime();

                        return isToday
                          ? messageDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : messageDate.toLocaleDateString([], {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            });
                      })()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={isInitialLoad ? bottomRef : null} />
          </Card>
          <Card className=" p-4 relative rounded-none">
            <div className="flex flex-col md:flex-row px-4 rounded-md items-center gap-2">
              <div className="w-full">
                {selectedFile && (
                  <div className="mb-2 w-auto">
                    <span className="font-semibold"></span>{" "}
                    <span className="px-2">
                      {selectedFile && selectedFile.name}
                    </span>{" "}
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="bg-red-50 hover:bg-red-500 rounded p-2 text-red-500 hover:text-white"
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}
                <Textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("place_holder.type_message")}
                  rows={1}
                  className="app-input"
                />
              </div>

              <label className="cursor-pointer bg-transparent  px-3 py-2  text-sm text-gray-500 dark:text-white hidden md:block">
                <Paperclip />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                  key={selectedFile?.name}
                />
              </label>
              <div className="flex items-center">
                <div className="relative pr-2">
                  <Button
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="px-3 text-xl bg-transparent hover:bg-transparent"
                  >
                    😊
                  </Button>
                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="right-0 absolute bottom-12 z-50"
                    >
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-transparent  px-3 py-2  text-sm text-gray-500 md:hidden block">
                  <Paperclip />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                    key={selectedFile?.name}
                  />
                </label>
                <Button
                  disabled={
                    isSubmitting || (!newMessage.trim() && !selectedFile)
                  }
                  onClick={sendMessage}
                  className="bg-blue-500 text-white px-4 rounded-md hover:bg-blue-600 h-[36px] text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  )}{" "}
                  {t("button.send")}
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div
          className={`flex-1 sm:flex flex-col ${
            showMobileChat ? "flex" : "hidden"
          }`}
        >
          <Card className="p-8 flex items-center rounded-none"></Card>
          <Card className="flex-1 overflow-y-auto items-center rounded-none justify-center p-4 bg-[#F5F5F5] dark:bg-gray-900">
            <div className="flex items-center justify-center h-full">
              <p>{t("common.select_user_to_start_chat")}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Chat;
