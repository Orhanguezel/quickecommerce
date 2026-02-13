import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AiChatMessage } from "@/modules/ai-chat/ai-chat.type";

interface ChatWidgetState {
  isOpen: boolean;
  messages: AiChatMessage[];
  sessionId: string;
  isTyping: boolean;

  toggle: () => void;
  open: () => void;
  close: () => void;
  addMessage: (msg: AiChatMessage) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

const generateSessionId = () =>
  `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

export const useChatWidgetStore = create<ChatWidgetState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      sessionId: generateSessionId(),
      isTyping: false,

      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),
      setTyping: (typing) => set({ isTyping: typing }),
      clearMessages: () =>
        set({ messages: [], sessionId: generateSessionId() }),
    }),
    {
      name: "chat-widget-storage",
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages.slice(-50),
      }),
    }
  )
);
