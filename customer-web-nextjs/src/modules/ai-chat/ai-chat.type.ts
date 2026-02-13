export interface AiChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface AiChatSendResponse {
  success: boolean;
  data: {
    message: string;
    conversation_id: number;
    tokens_used: number;
  };
}

export interface AiChatStatusResponse {
  success: boolean;
  data: {
    enabled: boolean;
    guest_enabled: boolean;
  };
}
