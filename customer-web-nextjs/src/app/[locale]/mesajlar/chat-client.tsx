"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import {
  useChatListQuery,
  useChatMessagesQuery,
  useSendMessageMutation,
  useMarkChatSeenMutation,
} from "@/modules/chat/chat.service";
import type { ChatContact } from "@/modules/chat/chat.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  Loader2,
  ArrowLeft,
  Search,
  Paperclip,
  Store,
  Truck,
  Image as ImageIcon,
  FileText,
  X,
} from "lucide-react";

interface Props {
  translations: Record<string, string>;
}

type TabType = "store" | "deliveryman";

export function ChatClient({ translations: t }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("store");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(
    null
  );
  const [messageText, setMessageText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chatData, isLoading: listLoading } = useChatListQuery({
    type: activeTab,
    search: searchQuery || undefined,
  });

  const { data: messagesData, isLoading: messagesLoading } =
    useChatMessagesQuery(selectedContact?.chat_id ?? null);

  const sendMessage = useSendMessageMutation();
  const markSeen = useMarkChatSeenMutation();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  // Mark as seen when opening a chat
  useEffect(() => {
    if (selectedContact?.chat_id && selectedContact.unread_count > 0) {
      markSeen.mutate(selectedContact.chat_id);
    }
  }, [selectedContact?.chat_id]);

  const handleSend = () => {
    if ((!messageText.trim() && !attachedFile) || !selectedContact) return;

    sendMessage.mutate(
      {
        receiver_id: selectedContact.id,
        receiver_type: selectedContact.type,
        message: messageText.trim() || undefined,
        file: attachedFile || undefined,
      },
      {
        onSuccess: () => {
          setMessageText("");
          setAttachedFile(null);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const contacts = chatData?.contacts ?? [];
  const messages = messagesData?.messages ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.messages}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">
        <MessageCircle className="mr-2 inline-block h-6 w-6" />
        {t.messages}
      </h1>

      <div className="overflow-hidden rounded-lg border bg-card" style={{ height: "70vh" }}>
        <div className="flex h-full">
          {/* Sidebar - Contact List */}
          <div
            className={`w-full flex-shrink-0 border-r md:w-80 ${
              selectedContact ? "hidden md:flex md:flex-col" : "flex flex-col"
            }`}
          >
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("store")}
                className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "store"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Store className="h-4 w-4" />
                {t.stores}
              </button>
              <button
                onClick={() => setActiveTab("deliveryman")}
                className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "deliveryman"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Truck className="h-4 w-4" />
                {t.deliverymen}
              </button>
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search_contacts}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {listLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {t.no_conversations}
                  </p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedContact?.id === contact.id
                        ? "bg-primary/5"
                        : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {contact.type === "store" ? (
                        <Store className="h-5 w-5" />
                      ) : (
                        <Truck className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium">
                          {contact.name}
                        </p>
                        {contact.unread_count > 0 && (
                          <span className="ml-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>
                      {contact.last_message && (
                        <p className="truncate text-xs text-muted-foreground">
                          {contact.last_message}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`flex flex-1 flex-col ${
              selectedContact ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {selectedContact.type === "store" ? (
                      <Store className="h-4 w-4" />
                    ) : (
                      <Truck className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedContact.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedContact.type === "store"
                        ? t.stores
                        : t.deliverymen}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        {t.no_conversations}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...messages].reverse().map((msg) => {
                        const isSender =
                          msg.sender_type === "customer" ||
                          msg.sender_type === "App\\Models\\Customer";
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isSender ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                                isSender
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {msg.file && (
                                <div className="mb-1">
                                  {/\.(png|jpg|jpeg|gif|webp)$/i.test(
                                    msg.file
                                  ) ? (
                                    <ImageIcon className="mr-1 inline h-4 w-4" />
                                  ) : (
                                    <FileText className="mr-1 inline h-4 w-4" />
                                  )}
                                  <a
                                    href={msg.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    {t.attach_file}
                                  </a>
                                </div>
                              )}
                              {msg.message && <p>{msg.message}</p>}
                              <p
                                className={`mt-1 text-[10px] ${
                                  isSender
                                    ? "text-primary-foreground/60"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {msg.created_at}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t p-3">
                  {attachedFile && (
                    <div className="mb-2 flex items-center gap-2 rounded bg-muted px-3 py-1.5 text-sm">
                      <FileText className="h-4 w-4" />
                      <span className="flex-1 truncate">
                        {attachedFile.name}
                      </span>
                      <button onClick={() => setAttachedFile(null)}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setAttachedFile(file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.type_message}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      className="flex-shrink-0"
                      onClick={handleSend}
                      disabled={
                        (!messageText.trim() && !attachedFile) ||
                        sendMessage.isPending
                      }
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    {t.select_conversation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
