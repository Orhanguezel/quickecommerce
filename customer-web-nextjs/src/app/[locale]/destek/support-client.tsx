"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import {
  useTicketListQuery,
  useTicketMessagesQuery,
  useCreateTicketMutation,
  useAddMessageMutation,
  useResolveTicketMutation,
} from "@/modules/support/support.service";
import type { SupportTicket, TicketMessage } from "@/modules/support/support.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Headphones,
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Send,
  CheckCircle,
} from "lucide-react";

interface Props {
  translations: Record<string, string>;
}

type View = "list" | "create" | "conversation";

export function SupportClient({ translations: t }: Props) {
  const [view, setView] = useState<View>("list");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Create form
  const [createForm, setCreateForm] = useState({
    title: "",
    subject: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    department_id: 1,
  });

  // Queries
  const { data: ticketsData, isLoading: ticketsLoading } =
    useTicketListQuery({ page, status: statusFilter || undefined });
  const { data: messages, isLoading: messagesLoading } =
    useTicketMessagesQuery(selectedTicketId);

  // Mutations
  const createMutation = useCreateTicketMutation();
  const addMessageMutation = useAddMessageMutation();
  const resolveMutation = useResolveTicketMutation();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    const key = `priority_${priority}`;
    return t[key] || priority;
  };

  const handleCreate = () => {
    createMutation.mutate(createForm, {
      onSuccess: () => {
        setView("list");
        setCreateForm({
          title: "",
          subject: "",
          priority: "medium",
          department_id: 1,
        });
      },
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicketId) return;
    addMessageMutation.mutate(
      { ticket_id: selectedTicketId, message: newMessage.trim() },
      { onSuccess: () => setNewMessage("") }
    );
  };

  const openConversation = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setView("conversation");
  };

  const tickets = ticketsData?.tickets ?? [];
  const meta = ticketsData?.meta;
  const totalPages = meta?.last_page ?? 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.support}</span>
      </nav>

      {/* === LIST VIEW === */}
      {view === "list" && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <Headphones className="mr-2 inline-block h-6 w-6" />
              {t.support}
            </h1>
            <Button size="sm" onClick={() => setView("create")}>
              <Plus className="mr-1 h-4 w-4" />
              {t.new_ticket}
            </Button>
          </div>

          {/* Status Filter */}
          <div className="mb-4 flex gap-2">
            {["", "1", "0"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s === ""
                  ? t.filter_all
                  : s === "1"
                    ? t.status_open
                    : t.status_closed}
              </button>
            ))}
          </div>

          {ticketsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center">
              <Headphones className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground">{t.no_tickets}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket: SupportTicket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{ticket.title}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                      >
                        {getPriorityLabel(ticket.priority)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          ticket.status === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ticket.status === 1 ? t.status_open : t.status_closed}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ticket.department} · #{ticket.id}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openConversation(ticket.id)}
                  >
                    <MessageSquare className="mr-1 h-3.5 w-3.5" />
                    {t.view_conversation}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t.previous}
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                {t.page} {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                {t.next}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* === CREATE VIEW === */}
      {view === "create" && (
        <>
          <div className="mb-6 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("list")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{t.new_ticket}</h1>
          </div>

          <div className="max-w-lg space-y-4 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <Label>{t.ticket_title}</Label>
              <Input
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm({ ...createForm, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t.ticket_subject}</Label>
              <Textarea
                value={createForm.subject}
                onChange={(e) =>
                  setCreateForm({ ...createForm, subject: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.ticket_priority}</Label>
              <Select
                value={createForm.priority}
                onValueChange={(v: any) =>
                  setCreateForm({ ...createForm, priority: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t.priority_low}</SelectItem>
                  <SelectItem value="medium">{t.priority_medium}</SelectItem>
                  <SelectItem value="high">{t.priority_high}</SelectItem>
                  <SelectItem value="urgent">{t.priority_urgent}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createMutation.isError && (
              <p className="text-sm text-destructive">
                {(createMutation.error as any)?.response?.data?.message ||
                  t.error}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={
                  createMutation.isPending ||
                  !createForm.title ||
                  !createForm.subject
                }
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t.save}
              </Button>
              <Button variant="outline" onClick={() => setView("list")}>
                {t.cancel}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* === CONVERSATION VIEW === */}
      {view === "conversation" && selectedTicketId && (
        <>
          <div className="mb-6 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setView("list");
                setSelectedTicketId(null);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">
              {t.support} #{selectedTicketId}
            </h1>
          </div>

          <div className="rounded-lg border bg-card">
            {/* Messages */}
            <div className="max-h-[50vh] space-y-4 overflow-y-auto p-6">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {t.no_tickets}
                </p>
              ) : (
                messages.map((msg: TicketMessage) => {
                  const isCustomer =
                    msg.message.role === "customer_level";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          isCustomer
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-xs font-medium opacity-70">
                          {msg.sender_details?.name || msg.message.from}
                        </p>
                        {msg.message.message && (
                          <p className="mt-1 text-sm">{msg.message.message}</p>
                        )}
                        {msg.message.file && (
                          <a
                            href={msg.message.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs underline"
                          >
                            📎 Dosya
                          </a>
                        )}
                        <p className="mt-1 text-[11px] opacity-50">
                          {msg.message.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t.type_message}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    addMessageMutation.isPending || !newMessage.trim()
                  }
                >
                  {addMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resolveMutation.mutate(selectedTicketId)}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  {t.resolve_ticket}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
