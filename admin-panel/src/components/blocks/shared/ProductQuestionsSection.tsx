"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/modules/core/base.service";
import { Card, CardContent, Textarea } from "@/components/ui";
import { Badge } from "@/components/ui";
import {
  MessageCircleQuestion,
  MessageSquareQuote,
  Send,
  ChevronDown,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface ProductQuestionsSectionProps {
  productId: number | string;
  /** "admin" = read-only reply view, "seller" = can reply */
  mode: "admin" | "seller";
  /** API endpoint for listing questions */
  listEndpoint: string;
  /** API endpoint for replying (seller only) */
  replyEndpoint?: string;
}

interface QuestionItem {
  id: number;
  question: string;
  customer: string;
  reply: string | null;
  replied_at: string | null;
  status: number;
  created_at: string | null;
  product?: { name: string };
  store?: { name: string };
}

export default function ProductQuestionsSection({
  productId,
  mode,
  listEndpoint,
  replyEndpoint,
}: ProductQuestionsSectionProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);

  const { getAxiosInstance } = useBaseService(listEndpoint);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["product-questions-edit", productId, page],
    queryFn: async () => {
      const res = await getAxiosInstance().get(listEndpoint, {
        params: { product_id: productId, per_page: 10, page },
      });
      return res.data;
    },
    enabled: !!productId,
  });

  const { getAxiosInstance: getReplyAxios } = useBaseService(replyEndpoint || "");

  const replyMutation = useMutation({
    mutationFn: async (payload: { question_id: number; reply: string }) => {
      if (!replyEndpoint) return;
      const res = await getReplyAxios().post(replyEndpoint, payload);
      return res.data;
    },
    onSuccess: () => {
      setReplyingId(null);
      setReplyText("");
      refetch();
    },
  });

  const questions: QuestionItem[] = data?.data || [];
  const meta = data?.meta || { current_page: 1, last_page: 1, total: 0 };

  const handleReply = (questionId: number) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ question_id: questionId, reply: replyText.trim() });
  };

  if (!productId) return null;

  return (
    <Card className="mt-4">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5 text-primary" />
            {t("common.questions")} ({meta.total || 0})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("common.no_data")}
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-lg border bg-card overflow-hidden"
              >
                {/* Question */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                        <MessageCircleQuestion className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">
                            {q.customer || "Anonim"}
                          </span>
                          {q.created_at && (
                            <span className="text-xs text-muted-foreground">
                              {q.created_at}
                            </span>
                          )}
                          <Badge
                            variant={q.status ? "default" : "destructive"}
                            className="text-[10px]"
                          >
                            {q.status ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm">{q.question}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply */}
                {q.reply && (
                  <div className="border-t bg-green-50 dark:bg-green-950/30 p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                        <MessageSquareQuote className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            {t("common.reply")}
                          </span>
                          {q.replied_at && (
                            <span className="text-xs text-muted-foreground">
                              {q.replied_at}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm">{q.reply}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply form (seller only, no existing reply) */}
                {mode === "seller" && !q.reply && replyEndpoint && (
                  <div className="border-t p-3 sm:p-4">
                    {replyingId === q.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t("common.write_reply")}
                          className="app-input text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setReplyingId(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted"
                          >
                            {t("button.cancel")}
                          </button>
                          <button
                            onClick={() => handleReply(q.id)}
                            disabled={!replyText.trim() || replyMutation.isPending}
                            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
                          >
                            <Send className="h-3.5 w-3.5" />
                            {t("button.reply")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingId(q.id);
                          setReplyText(q.reply || "");
                        }}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        {t("button.reply")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted disabled:opacity-50"
                >
                  &laquo;
                </button>
                <span className="px-3 py-1.5 text-sm">
                  {page} / {meta.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page >= meta.last_page}
                  className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted disabled:opacity-50"
                >
                  &raquo;
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
