import { create } from 'zustand';
import { ChatRoom, Message } from '../api/feedChatApi';

interface ChatState {
  chats: ChatRoom[];
  messagesByRoom: Record<string, Message[]>;
  isLoading: boolean;
  totalUnread: number;
  setChats: (chats: ChatRoom[]) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateLastMessage: (chatId: string, message: Message) => void;
  markAsRead: (chatId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  chats: [],
  messagesByRoom: {},
  isLoading: false,
  totalUnread: 0,
  setChats: (chats) => {
    const total = chats.reduce((sum, c) => sum + c.unreadCount, 0);
    set({ chats, totalUnread: total });
  },
  setMessages: (chatId, messages) =>
    set((state) => ({ messagesByRoom: { ...state.messagesByRoom, [chatId]: messages } })),
  addMessage: (chatId, message) =>
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [chatId]: [...(state.messagesByRoom[chatId] || []), message],
      },
    })),
  updateLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, lastMessage: message } : c
      ),
    })),
  markAsRead: (chatId) =>
    set((state) => {
      const chats = state.chats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      );
      const total = chats.reduce((sum, c) => sum + c.unreadCount, 0);
      return { chats, totalUnread: total };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
