import { type QueryOptions } from "@/types";

export interface ChatSettingsQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
}

export interface ChatSettings {
  com_pusher_app_id?: string;
  com_pusher_app_key?: string;
  com_pusher_app_secret?: string;
  com_pusher_app_cluster?: string;
}

export interface LiveChatQueryOptions extends QueryOptions {
  sort?: string;
  sortField?: string;
  pagination?: boolean;
  store_id?: string;
  receiver_id?: string | number;
  receiver_type?: string;
  search?: string;
  type?: string;
  per_page?: number;
  page?: number;
}

export interface LiveChat {
  id?: string | number;
}

export interface AiChatSettings {
  com_ai_chat_enabled?: string;
  com_ai_chat_active_provider?: "groq" | "openai" | "anthropic" | "gemini" | "";
  com_ai_chat_api_key?: string;
  com_ai_chat_model?: string;
  com_ai_chat_max_tokens?: number | string;
  com_ai_chat_temperature?: number | string;
  com_ai_chat_system_prompt?: string;
  com_ai_chat_guest_enabled?: string;
  translations?: Record<string, string>;
}

export interface AiChatKnowledgeItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
  translations?: Array<{
    language: string;
    key: "question" | "answer" | string;
    value: string;
  }>;
}
