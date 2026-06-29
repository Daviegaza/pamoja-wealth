import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  chamaId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  sendMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
}

const mockMessages: ChatMessage[] = [
  {
    id: "chat_m1",
    chamaId: "cha_1",
    userId: "usr_1",
    userName: "Amara Okafor",
    userAvatar: "",
    content:
      "Hello everyone! Excited to be part of this chama. When is our next meeting?",
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "chat_m2",
    chamaId: "cha_1",
    userId: "usr_25",
    userName: "Kofi Mensah",
    userAvatar: "",
    content:
      "Welcome Amara! Our next meeting is scheduled for next Saturday at 10 AM.",
    timestamp: new Date(Date.now() - 86400000 * 5 + 3600000).toISOString(),
  },
  {
    id: "chat_m3",
    chamaId: "cha_1",
    userId: "usr_78",
    userName: "Zuri Patel",
    userAvatar: "",
    content:
      "Don't forget everyone, contributions are due by the 15th. Let's make sure we're all up to date!",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "chat_m4",
    chamaId: "cha_1",
    userId: "usr_1",
    userName: "Amara Okafor",
    userAvatar: "",
    content:
      "Thanks Kofi! I'll be there. And Zuri, I've already made my contribution for this month.",
    timestamp: new Date(Date.now() - 86400000 * 3 + 7200000).toISOString(),
  },
  {
    id: "chat_m5",
    chamaId: "cha_1",
    userId: "usr_112",
    userName: "James Ochieng",
    userAvatar: "",
    content:
      "Great progress team! Our investment portfolio is up 12% this quarter.",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "chat_m6",
    chamaId: "cha_1",
    userId: "usr_45",
    userName: "Amina Hassan",
    userAvatar: "",
    content:
      "That's amazing James! Has anyone looked into the new money market fund option?",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "chat_m7",
    chamaId: "cha_1",
    userId: "usr_78",
    userName: "Zuri Patel",
    userAvatar: "",
    content:
      "I checked it out. The returns look promising — 8.5% projected annual return with low risk.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: mockMessages,
      sendMessage: (msg) => {
        const newMessage: ChatMessage = {
          ...msg,
          id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        };
        set({ messages: [...get().messages, newMessage] });
      },
    }),
    { name: "pamoja-chat" }
  )
);
