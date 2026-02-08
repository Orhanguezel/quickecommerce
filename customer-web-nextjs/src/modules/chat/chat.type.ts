export interface ChatContact {
  id: number;
  chat_id: number;
  name: string;
  image: string | null;
  type: "store" | "deliveryman";
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_type: string;
  receiver_id: number;
  receiver_type: string;
  message: string | null;
  file: string | null;
  is_seen: boolean;
  created_at: string;
}

export interface ChatListResponse {
  success: boolean;
  data: ChatContact[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ChatMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
