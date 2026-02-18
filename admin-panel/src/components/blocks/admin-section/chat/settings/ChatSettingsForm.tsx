"use client";

import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";
import multiLang from "@/components/molecules/multiLang.json";
import { SubmitButton } from "@/components/blocks/shared";
import { Button, Card, CardContent, Input, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@/components/ui";
import { AdminI18nJsonPanel } from "@/lib/json";
import type { ViewMode } from "@/lib/json";
import {
  useAiChatKnowledgeCreateMutation,
  useAiChatKnowledgeDeleteMutation,
  useAiChatKnowledgeListQuery,
  useAiChatKnowledgeStatusMutation,
  useAiChatKnowledgeUpdateMutation,
  useAiChatConversationMessagesQuery,
  useAiChatConversationsQuery,
  useAiChatSettingsQuery,
  useAiChatSettingsStoreMutation,
  useChatSettingsQuery,
  useChatSettingsStoreMutation,
} from "@/modules/admin-section/chat/chat.action";
import {
  AiChatKnowledgeFormData,
  ChatSettingsFormData,
  ChatSettingsSchema,
} from "@/modules/admin-section/chat/chat.schema";
import { AiChatKnowledgeItem } from "@/modules/admin-section/chat/chat.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const emptyKnowledgeForm: AiChatKnowledgeFormData = {
  category: "general",
  question: "",
  answer: "",
  sort_order: 0,
  is_active: true,
  question_en: "",
  answer_en: "",
};

const buildEmptyKnowledgeTranslations = (langs: Array<any>) => {
  const out: Record<string, { question: string; answer: string }> = {};
  langs.forEach((lang) => {
    const id = String(lang?.id || "");
    if (!id) return;
    out[id] = { question: "", answer: "" };
  });
  if (!out.df) out.df = { question: "", answer: "" };
  return out;
};

const ChatSettingsForm = () => {
  const languageTabs = useMemo(() => {
    const list = Array.isArray(multiLang) ? (multiLang as Array<any>) : [];
    return list.filter((l) => String(l?.id || "").length > 0);
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    reset: resetPusherForm,
  } = useForm<ChatSettingsFormData>({
    resolver: zodResolver(ChatSettingsSchema),
    defaultValues: {
      com_pusher_app_id: "",
      com_pusher_app_key: "",
      com_pusher_app_secret: "",
      com_pusher_app_cluster: "",
    },
  });

  const { ChatSettingsData, refetch: refetchPusher, isPending: isPusherLoading } = useChatSettingsQuery({});
  const { mutate: savePusherSettings, isPending: isPusherSaving } = useChatSettingsStoreMutation();

  const { AiChatSettingsData, refetch: refetchAiSettings, isPending: isAiSettingsLoading } = useAiChatSettingsQuery();
  const { mutate: saveAiSettings, isPending: isAiSaving } = useAiChatSettingsStoreMutation();

  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [knowledgeViewMode, setKnowledgeViewMode] = useState<ViewMode>("form");
  const [activeKnowledgeLang, setActiveKnowledgeLang] = useState("df");
  const [conversationPage, setConversationPage] = useState(1);
  const [conversationPerPage, setConversationPerPage] = useState(20);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messagePage, setMessagePage] = useState(1);
  const [messagePerPage, setMessagePerPage] = useState(30);
  const {
    KnowledgeList,
    refetch: refetchKnowledge,
    isPending: isKnowledgeLoading,
  } = useAiChatKnowledgeListQuery({ search: knowledgeSearch, per_page: 100, page: 1 });
  const { mutate: createKnowledge, isPending: isKnowledgeCreating } = useAiChatKnowledgeCreateMutation();
  const { mutate: updateKnowledge, isPending: isKnowledgeUpdating } = useAiChatKnowledgeUpdateMutation();
  const { mutate: toggleKnowledgeStatus, isPending: isKnowledgeToggling } = useAiChatKnowledgeStatusMutation();
  const { mutate: deleteKnowledge, isPending: isKnowledgeDeleting } = useAiChatKnowledgeDeleteMutation();
  const {
    Conversations,
    pagination: conversationPagination,
    refetch: refetchConversations,
    isPending: isConversationsLoading,
  } = useAiChatConversationsQuery({ page: conversationPage, per_page: conversationPerPage });
  const {
    Messages: conversationMessages,
    pagination: messagePagination,
    conversation: selectedConversation,
    refetch: refetchConversationMessages,
    isPending: isConversationMessagesLoading,
  } = useAiChatConversationMessagesQuery(selectedConversationId, {
    page: messagePage,
    per_page: messagePerPage,
  });

  const [aiForm, setAiForm] = useState({
    com_ai_chat_enabled: "",
    com_ai_chat_guest_enabled: "",
    com_ai_chat_active_provider: "groq",
    com_ai_chat_api_key: "",
    com_ai_chat_model: "",
    com_ai_chat_max_tokens: "1024",
    com_ai_chat_temperature: "0.7",
    prompt_by_lang: { df: "", en: "" } as Record<string, string>,
  });
  const [activePromptLang, setActivePromptLang] = useState("df");

  const [knowledgeForm, setKnowledgeForm] = useState<AiChatKnowledgeFormData>(emptyKnowledgeForm);
  const [knowledgeTranslations, setKnowledgeTranslations] = useState<
    Record<string, { question: string; answer: string }>
  >({});
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<number | null>(null);

  const pusherDefaults = useMemo(
    () => ({
      com_pusher_app_id: (ChatSettingsData as any)?.com_pusher_app_id ?? "",
      com_pusher_app_key: (ChatSettingsData as any)?.com_pusher_app_key ?? "",
      com_pusher_app_secret: (ChatSettingsData as any)?.com_pusher_app_secret ?? "",
      com_pusher_app_cluster: (ChatSettingsData as any)?.com_pusher_app_cluster ?? "",
    }),
    [
      (ChatSettingsData as any)?.com_pusher_app_id,
      (ChatSettingsData as any)?.com_pusher_app_key,
      (ChatSettingsData as any)?.com_pusher_app_secret,
      (ChatSettingsData as any)?.com_pusher_app_cluster,
    ]
  );

  useEffect(() => {
    const current = getValues();
    const changed =
      current.com_pusher_app_id !== pusherDefaults.com_pusher_app_id ||
      current.com_pusher_app_key !== pusherDefaults.com_pusher_app_key ||
      current.com_pusher_app_secret !== pusherDefaults.com_pusher_app_secret ||
      current.com_pusher_app_cluster !== pusherDefaults.com_pusher_app_cluster;

    if (changed) {
      resetPusherForm(pusherDefaults);
    }
  }, [getValues, pusherDefaults, resetPusherForm]);

  const aiDefaults = useMemo(() => {
    const data: any = AiChatSettingsData || {};
    const translations = data?.translations || {};
    const firstTranslationValue = Object.values(translations).find(
      (v) => typeof v === "string" && v.trim().length > 0
    ) as string | undefined;
    const promptByLang: Record<string, string> = {};
    languageTabs.forEach((lang) => {
      const langId = String(lang.id);
      if (langId === "df") {
        promptByLang[langId] = data?.com_ai_chat_system_prompt || firstTranslationValue || "";
      } else {
        promptByLang[langId] = translations?.[langId] || "";
      }
    });

    return {
      com_ai_chat_enabled: data?.com_ai_chat_enabled || "",
      com_ai_chat_guest_enabled: data?.com_ai_chat_guest_enabled || "",
      com_ai_chat_active_provider: data?.com_ai_chat_active_provider || "groq",
      com_ai_chat_api_key: data?.com_ai_chat_api_key || "",
      com_ai_chat_model: data?.com_ai_chat_model || "",
      com_ai_chat_max_tokens: String(data?.com_ai_chat_max_tokens || "1024"),
      com_ai_chat_temperature: String(data?.com_ai_chat_temperature || "0.7"),
      prompt_by_lang: promptByLang,
    };
  }, [
    (AiChatSettingsData as any)?.com_ai_chat_enabled,
    (AiChatSettingsData as any)?.com_ai_chat_guest_enabled,
    (AiChatSettingsData as any)?.com_ai_chat_active_provider,
    (AiChatSettingsData as any)?.com_ai_chat_api_key,
    (AiChatSettingsData as any)?.com_ai_chat_model,
    (AiChatSettingsData as any)?.com_ai_chat_max_tokens,
    (AiChatSettingsData as any)?.com_ai_chat_temperature,
    (AiChatSettingsData as any)?.com_ai_chat_system_prompt,
    JSON.stringify((AiChatSettingsData as any)?.translations || {}),
    JSON.stringify(languageTabs),
  ]);

  useEffect(() => {
    setAiForm((prev) => {
      const same = JSON.stringify(prev) === JSON.stringify(aiDefaults);
      return same ? prev : aiDefaults;
    });
  }, [aiDefaults]);

  useEffect(() => {
    if (!languageTabs.some((l) => String(l.id) === activePromptLang)) {
      setActivePromptLang(String(languageTabs?.[0]?.id || "df"));
    }
  }, [languageTabs, activePromptLang]);

  useEffect(() => {
    setKnowledgeTranslations((prev) => {
      const base = buildEmptyKnowledgeTranslations(languageTabs);
      Object.keys(base).forEach((langId) => {
        if (prev?.[langId]) {
          base[langId] = {
            question: prev[langId].question || "",
            answer: prev[langId].answer || "",
          };
        }
      });
      return base;
    });
  }, [languageTabs]);

  useEffect(() => {
    if (!languageTabs.some((l) => String(l.id) === activeKnowledgeLang)) {
      setActiveKnowledgeLang(String(languageTabs?.[0]?.id || "df"));
    }
  }, [languageTabs, activeKnowledgeLang]);

  const knowledgeItems: AiChatKnowledgeItem[] = useMemo(
    () => (Array.isArray(KnowledgeList) ? (KnowledgeList as AiChatKnowledgeItem[]) : []),
    [KnowledgeList]
  );

  const onSavePusher = (values: ChatSettingsFormData) => {
    savePusherSettings(values, {
      onSuccess: () => {
        refetchPusher();
      },
    });
  };

  const onSaveAiSettings = (e: FormEvent) => {
    e.preventDefault();
    const translationPayload = Object.fromEntries(
      languageTabs
        .map((lang) => String(lang.id))
        .filter((id) => id !== "df")
        .map((id) => [id, aiForm.prompt_by_lang?.[id] || ""])
    );
    const defaultPrompt =
      aiForm.prompt_by_lang?.df ||
      Object.values(translationPayload).find(
        (v) => typeof v === "string" && v.trim().length > 0
      ) ||
      "";

    saveAiSettings(
      {
        com_ai_chat_enabled: aiForm.com_ai_chat_enabled,
        com_ai_chat_guest_enabled: aiForm.com_ai_chat_guest_enabled,
        com_ai_chat_active_provider: aiForm.com_ai_chat_active_provider as any,
        com_ai_chat_api_key: aiForm.com_ai_chat_api_key,
        com_ai_chat_model: aiForm.com_ai_chat_model,
        com_ai_chat_max_tokens: Number(aiForm.com_ai_chat_max_tokens || 1024),
        com_ai_chat_temperature: Number(aiForm.com_ai_chat_temperature || 0.7),
        com_ai_chat_system_prompt: String(defaultPrompt),
        translations: translationPayload,
      } as any,
      {
        onSuccess: () => {
          refetchAiSettings();
        },
      }
    );
  };

  const onEditKnowledge = (item: AiChatKnowledgeItem) => {
    const byLang = buildEmptyKnowledgeTranslations(languageTabs);
    byLang.df = {
      question: item.question || "",
      answer: item.answer || "",
    };
    (item?.translations || []).forEach((tr: any) => {
      const langId = String(tr?.language || "");
      const key = String(tr?.key || "");
      if (!langId || !["question", "answer"].includes(key)) return;
      if (!byLang[langId]) byLang[langId] = { question: "", answer: "" };
      byLang[langId][key as "question" | "answer"] = tr?.value || "";
    });

    if (!byLang.df.question) {
      const fallbackQ = Object.values(byLang).find((v) => v.question?.trim()?.length > 0)?.question || "";
      byLang.df.question = fallbackQ;
    }
    if (!byLang.df.answer) {
      const fallbackA = Object.values(byLang).find((v) => v.answer?.trim()?.length > 0)?.answer || "";
      byLang.df.answer = fallbackA;
    }

    setEditingKnowledgeId(item.id);
    setKnowledgeForm({
      id: item.id,
      category: item.category,
      question: byLang.df.question,
      answer: byLang.df.answer,
      sort_order: item.sort_order || 0,
      is_active: Boolean(item.is_active),
      question_en: byLang.en?.question || "",
      answer_en: byLang.en?.answer || "",
    });
    setKnowledgeTranslations(byLang);
  };

  const onResetKnowledgeForm = () => {
    setEditingKnowledgeId(null);
    setKnowledgeForm(emptyKnowledgeForm);
    setKnowledgeTranslations(buildEmptyKnowledgeTranslations(languageTabs));
  };

  const onSaveKnowledge = (e: FormEvent) => {
    e.preventDefault();
    const normalizedTranslations = buildEmptyKnowledgeTranslations(languageTabs);
    Object.keys(normalizedTranslations).forEach((langId) => {
      const src = knowledgeTranslations?.[langId];
      if (src) {
        normalizedTranslations[langId] = {
          question: src.question || "",
          answer: src.answer || "",
        };
      }
    });

    const dfQuestion =
      normalizedTranslations.df?.question ||
      Object.values(normalizedTranslations).find((v) => v.question?.trim()?.length > 0)?.question ||
      "";
    const dfAnswer =
      normalizedTranslations.df?.answer ||
      Object.values(normalizedTranslations).find((v) => v.answer?.trim()?.length > 0)?.answer ||
      "";

    const translationPayload = Object.fromEntries(
      Object.entries(normalizedTranslations)
        .filter(([langId]) => langId !== "df")
        .map(([langId, values]) => [
          langId,
          {
            question: values.question || "",
            answer: values.answer || "",
          },
        ])
    );

    const payload = {
      id: editingKnowledgeId || undefined,
      category: knowledgeForm.category,
      question: dfQuestion,
      answer: dfAnswer,
      sort_order: Number(knowledgeForm.sort_order || 0),
      is_active: Boolean(knowledgeForm.is_active),
      translations: translationPayload,
    };

    if (editingKnowledgeId) {
      updateKnowledge(payload as any, {
        onSuccess: () => {
          onResetKnowledgeForm();
          refetchKnowledge();
        },
      });
      return;
    }

    createKnowledge(payload as any, {
      onSuccess: () => {
        onResetKnowledgeForm();
        refetchKnowledge();
      },
    });
  };

  const getKnowledgeValueByLang = (
    item: AiChatKnowledgeItem,
    langId: string,
    key: "question" | "answer"
  ) => {
    if (langId === "df") {
      return (item as any)?.[key] || "";
    }
    const row = (item?.translations || []).find(
      (tr: any) => String(tr?.language || "") === langId && String(tr?.key || "") === key
    );
    return row?.value || (item as any)?.[key] || "";
  };

  const isLoading = isPusherLoading || isAiSettingsLoading;
  const isKnowledgeBusy =
    isKnowledgeCreating || isKnowledgeUpdating || isKnowledgeToggling || isKnowledgeDeleting;

  if (isLoading) return <CardSkletonLoader />;

  return (
    <Tabs defaultValue="pusher" className="mt-4">
      <TabsList className="bg-white dark:bg-[#1f2937]">
        <TabsTrigger value="pusher">Pusher</TabsTrigger>
        <TabsTrigger value="ai-settings">AI Chat Ayarları</TabsTrigger>
        <TabsTrigger value="knowledge">AI Metinler (Knowledge)</TabsTrigger>
        <TabsTrigger value="conversations">AI Konuşma Geçmişi</TabsTrigger>
      </TabsList>

      <TabsContent value="pusher">
        <form onSubmit={handleSubmit(onSavePusher)}>
          <Card className="mt-4">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Pusher App ID</p>
                <Input {...register("com_pusher_app_id")} className="app-input" placeholder="Pusher App ID" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Pusher App Key</p>
                <Input {...register("com_pusher_app_key")} className="app-input" placeholder="Pusher App Key" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Pusher App Secret</p>
                <Input
                  {...register("com_pusher_app_secret")}
                  className="app-input"
                  placeholder="Pusher App Secret"
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Pusher Cluster</p>
                <Input
                  {...register("com_pusher_app_cluster")}
                  className="app-input"
                  placeholder="eu / mt1 / ap2"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton IsLoading={isPusherSaving} AddLabel="Pusher Ayarlarını Kaydet" />
          </Card>
        </form>
      </TabsContent>

      <TabsContent value="ai-settings">
        <form onSubmit={onSaveAiSettings}>
          <Card className="mt-4">
            <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Aktif Sağlayıcı</p>
                  <select
                    className="app-input w-full h-10 px-3 rounded-md border"
                    value={aiForm.com_ai_chat_active_provider}
                    onChange={(e) =>
                      setAiForm((prev) => ({ ...prev, com_ai_chat_active_provider: e.target.value }))
                    }
                  >
                    <option value="groq">Groq (OpenAI Compatible)</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">API Key</p>
                  <Input
                    className="app-input"
                    value={aiForm.com_ai_chat_api_key}
                    onChange={(e) => setAiForm((prev) => ({ ...prev, com_ai_chat_api_key: e.target.value }))}
                    placeholder="Provider API Key"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Model</p>
                  <Input
                    className="app-input"
                    value={aiForm.com_ai_chat_model}
                    onChange={(e) => setAiForm((prev) => ({ ...prev, com_ai_chat_model: e.target.value }))}
                    placeholder="llama-3.3-70b-versatile / gpt-4o-mini / ..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Max Tokens</p>
                    <Input
                      type="number"
                      className="app-input"
                      value={aiForm.com_ai_chat_max_tokens}
                      onChange={(e) =>
                        setAiForm((prev) => ({ ...prev, com_ai_chat_max_tokens: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Temperature</p>
                    <Input
                      type="number"
                      step="0.1"
                      className="app-input"
                      value={aiForm.com_ai_chat_temperature}
                      onChange={(e) =>
                        setAiForm((prev) => ({ ...prev, com_ai_chat_temperature: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">AI Chat Etkin</p>
                  <Switch
                    dir="ltr"
                    checked={aiForm.com_ai_chat_enabled === "on"}
                    onCheckedChange={(checked) =>
                      setAiForm((prev) => ({
                        ...prev,
                        com_ai_chat_enabled: checked ? "on" : "",
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Misafir AI Chat Etkin</p>
                  <Switch
                    dir="ltr"
                    checked={aiForm.com_ai_chat_guest_enabled === "on"}
                    onCheckedChange={(checked) =>
                      setAiForm((prev) => ({
                        ...prev,
                        com_ai_chat_guest_enabled: checked ? "on" : "",
                      }))
                    }
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">System Prompt (Dinamik Diller)</p>
                  <Tabs value={activePromptLang} onValueChange={setActivePromptLang}>
                    <TabsList className="bg-white dark:bg-[#1f2937] mb-2">
                      {languageTabs.map((lang) => (
                        <TabsTrigger key={lang.id} value={String(lang.id)}>
                          {String(lang?.label || lang?.id)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {languageTabs.map((lang) => {
                      const langId = String(lang.id);
                      return (
                        <TabsContent key={langId} value={langId}>
                          <Textarea
                            className="app-input min-h-[140px]"
                            value={aiForm.prompt_by_lang?.[langId] || ""}
                            onChange={(e) =>
                              setAiForm((prev) => ({
                                ...prev,
                                prompt_by_lang: {
                                  ...(prev.prompt_by_lang || {}),
                                  [langId]: e.target.value,
                                },
                              }))
                            }
                          />
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4 sticky bottom-0 w-full p-4">
            <SubmitButton IsLoading={isAiSaving} AddLabel="AI Chat Ayarlarını Kaydet" />
          </Card>
        </form>
      </TabsContent>

      <TabsContent value="knowledge">
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <Input
                className="app-input"
                placeholder="Metinlerde ara..."
                value={knowledgeSearch}
                onChange={(e) => setKnowledgeSearch(e.target.value)}
              />
              <Button type="button" onClick={() => refetchKnowledge()}>
                Ara / Yenile
              </Button>
            </div>

            <form onSubmit={onSaveKnowledge} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Kategori</p>
                  <Input
                    className="app-input"
                    value={knowledgeForm.category}
                    onChange={(e) => setKnowledgeForm((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="general / shipping / returns"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Sıra</p>
                  <Input
                    type="number"
                    className="app-input"
                    value={knowledgeForm.sort_order ?? 0}
                    onChange={(e) =>
                      setKnowledgeForm((prev) => ({ ...prev, sort_order: Number(e.target.value || 0) }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between border rounded-md p-3">
                  <p className="text-sm font-medium">Aktif</p>
                  <Switch
                    dir="ltr"
                    checked={Boolean(knowledgeForm.is_active)}
                    onCheckedChange={(checked) =>
                      setKnowledgeForm((prev) => ({
                        ...prev,
                        is_active: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    type="button"
                    variant={knowledgeViewMode === "form" ? "default" : "outline"}
                    onClick={() => setKnowledgeViewMode("form")}
                  >
                    Form
                  </Button>
                  <Button
                    type="button"
                    variant={knowledgeViewMode === "json" ? "default" : "outline"}
                    onClick={() => setKnowledgeViewMode("json")}
                  >
                    JSON
                  </Button>
                </div>

                {knowledgeViewMode === "form" ? (
                  <Tabs value={activeKnowledgeLang} onValueChange={setActiveKnowledgeLang}>
                    <TabsList className="bg-white dark:bg-[#1f2937] mb-2">
                      {languageTabs.map((lang) => {
                        const langId = String(lang.id);
                        return (
                          <TabsTrigger key={langId} value={langId}>
                            {String(lang?.label || langId)}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {languageTabs.map((lang) => {
                      const langId = String(lang.id);
                      const value = knowledgeTranslations?.[langId] || { question: "", answer: "" };
                      return (
                        <TabsContent key={langId} value={langId} className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Soru ({String(lang?.label || langId)})</p>
                            <Textarea
                              className="app-input min-h-[80px]"
                              value={value.question}
                              onChange={(e) =>
                                setKnowledgeTranslations((prev) => ({
                                  ...prev,
                                  [langId]: {
                                    ...(prev?.[langId] || { question: "", answer: "" }),
                                    question: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Cevap ({String(lang?.label || langId)})</p>
                            <Textarea
                              className="app-input min-h-[100px]"
                              value={value.answer}
                              onChange={(e) =>
                                setKnowledgeTranslations((prev) => ({
                                  ...prev,
                                  [langId]: {
                                    ...(prev?.[langId] || { question: "", answer: "" }),
                                    answer: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                ) : (
                  <AdminI18nJsonPanel
                    label="Knowledge Çeviri JSON"
                    languages={languageTabs as any}
                    value={knowledgeTranslations}
                    onChange={(next: any) => {
                      const safe = typeof next === "object" && next ? next : {};
                      const base = buildEmptyKnowledgeTranslations(languageTabs);
                      Object.keys(base).forEach((langId) => {
                        const cur = safe?.[langId];
                        if (cur && typeof cur === "object") {
                          base[langId] = {
                            question: String(cur?.question || ""),
                            answer: String(cur?.answer || ""),
                          };
                        }
                      });
                      setKnowledgeTranslations(base);
                    }}
                    perLanguage
                    showAllTab
                    initialActiveId={activeKnowledgeLang}
                    helperText={'Format: { dil: { question: "...", answer: "..." } }'}
                  />
                )}
              </div>

              <div className="lg:col-span-2 flex items-center gap-2">
                <Button type="submit" disabled={isKnowledgeBusy}>
                  {editingKnowledgeId ? "Güncelle" : "Yeni Metin Ekle"}
                </Button>
                <Button type="button" variant="outline" onClick={onResetKnowledgeForm}>
                  Temizle
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              {isKnowledgeLoading ? <CardSkletonLoader /> : null}
              {!isKnowledgeLoading && knowledgeItems.length === 0 ? (
                <div className="text-sm text-muted-foreground">Kayıt bulunamadı.</div>
              ) : null}

              {knowledgeItems.map((item) => {
                const previewQuestion = getKnowledgeValueByLang(item, activeKnowledgeLang, "question");
                const previewAnswer = getKnowledgeValueByLang(item, activeKnowledgeLang, "answer");
                return (
                <div key={item.id} className="border rounded-md p-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        [{item.category}] #{item.sort_order} - {previewQuestion}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{previewAnswer}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Aktif</span>
                        <Switch
                          dir="ltr"
                          checked={Boolean(item.is_active)}
                          onCheckedChange={() => toggleKnowledgeStatus({ id: item.id })}
                          disabled={isKnowledgeBusy}
                        />
                      </div>
                      <Button type="button" variant="outline" onClick={() => onEditKnowledge(item)}>
                        Düzenle
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => deleteKnowledge(item.id)}
                        disabled={isKnowledgeBusy}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="conversations">
        <Card className="mt-4">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                AI müşteri konuşmalarını izleyebilirsin.
              </p>
              <div className="flex items-center gap-2">
                <select
                  className="app-input h-10 px-3 rounded-md border"
                  value={conversationPerPage}
                  onChange={(e) => {
                    setConversationPerPage(Number(e.target.value));
                    setConversationPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <Button type="button" onClick={() => refetchConversations()}>
                  Yenile
                </Button>
              </div>
            </div>

            {isConversationsLoading ? <CardSkletonLoader /> : null}

            {!isConversationsLoading && (!Conversations || Conversations.length === 0) ? (
              <div className="text-sm text-muted-foreground">Konuşma kaydı bulunamadı.</div>
            ) : null}

            {!isConversationsLoading && Conversations?.length > 0 ? (
              <div className="space-y-2">
                {Conversations.map((row: any) => (
                  <div key={row.id} className="border rounded-md p-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Müşteri</p>
                        <p className="font-medium">
                          {row?.customer
                            ? `${row.customer.first_name || ""} ${row.customer.last_name || ""}`.trim()
                            : "Guest"}
                        </p>
                        <p className="text-xs text-muted-foreground">{row?.customer?.email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Session</p>
                        <p className="font-mono text-xs break-all">{row.session_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mesaj Sayısı</p>
                        <p className="font-medium">{row.messages_count ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Son Güncelleme</p>
                        <p className="font-medium">
                          {row.updated_at
                            ? new Date(row.updated_at).toLocaleString()
                            : "-"}
                        </p>
                        <div className="mt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedConversationId === row.id ? "default" : "outline"}
                            onClick={() => {
                              setSelectedConversationId(Number(row.id));
                              setMessagePage(1);
                            }}
                          >
                            Mesajları Gör
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {selectedConversationId ? (
              <div className="mt-4 border rounded-md p-3 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <p className="text-sm font-semibold">
                    Konuşma Detayı #{selectedConversationId}
                    {selectedConversation?.customer
                      ? ` - ${selectedConversation.customer.first_name || ""} ${selectedConversation.customer.last_name || ""}`.trim()
                      : " - Guest"}
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      className="app-input h-9 px-3 rounded-md border"
                      value={messagePerPage}
                      onChange={(e) => {
                        setMessagePerPage(Number(e.target.value));
                        setMessagePage(1);
                      }}
                    >
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                    <Button type="button" variant="outline" onClick={() => refetchConversationMessages()}>
                      Yenile
                    </Button>
                  </div>
                </div>

                {isConversationMessagesLoading ? <CardSkletonLoader /> : null}

                {!isConversationMessagesLoading && (!conversationMessages || conversationMessages.length === 0) ? (
                  <p className="text-sm text-muted-foreground">Bu konuşmada mesaj bulunamadı.</p>
                ) : null}

                {!isConversationMessagesLoading && conversationMessages?.length > 0 ? (
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {conversationMessages.map((msg: any) => {
                      const isAssistant = String(msg?.role || "") === "assistant";
                      const isUser = String(msg?.role || "") === "user";
                      return (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-md border ${
                            isAssistant
                              ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40"
                              : isUser
                              ? "bg-gray-50 border-gray-200 dark:bg-slate-800/60 dark:border-slate-700"
                              : "bg-white dark:bg-slate-900 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-200">
                              {msg.role || "unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {msg.created_at ? new Date(msg.created_at).toLocaleString() : "-"}
                            </span>
                          </div>
                          <p className="text-[15px] leading-6 whitespace-pre-wrap break-words text-slate-900 dark:text-slate-100 select-text">
                            {msg.content || ""}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!messagePagination?.prev_page_url}
                    onClick={() => setMessagePage((p) => Math.max(1, p - 1))}
                  >
                    Önceki
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Sayfa {messagePagination?.current_page || messagePage} / {messagePagination?.last_page || 1}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!messagePagination?.next_page_url}
                    onClick={() => setMessagePage((p) => p + 1)}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={!conversationPagination?.prev_page_url}
                onClick={() => {
                  setConversationPage((p) => Math.max(1, p - 1));
                  setSelectedConversationId(null);
                }}
              >
                Önceki
              </Button>
              <p className="text-sm text-muted-foreground">
                Sayfa {conversationPagination?.current_page || conversationPage} /{" "}
                {conversationPagination?.last_page || 1}
              </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!conversationPagination?.next_page_url}
                    onClick={() => {
                      setConversationPage((p) => p + 1);
                      setSelectedConversationId(null);
                    }}
                  >
                    Sonraki
                  </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ChatSettingsForm;
