import { create } from "zustand"
import { persist } from "zustand/middleware"
import { generateId } from "@/lib/utils"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  emotion?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  isTyping: boolean
  setActiveConversation: (id: string) => void
  createConversation: () => string
  addMessage: (conversationId: string, message: Omit<Message, "id">) => void
  deleteConversation: (id: string) => void
  setTyping: (typing: boolean) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [
        {
          id: "c1",
          title: "Morning Check-in",
          messages: [
            {
              id: "m1",
              role: "assistant",
              content: "Good morning! How are you feeling today? I'm here to support you. 💙",
              timestamp: new Date(Date.now() - 86400000),
              emotion: "🤗 Caring",
            },
            {
              id: "m2",
              role: "user",
              content: "Feeling a bit anxious about work today.",
              timestamp: new Date(Date.now() - 86300000),
            },
            {
              id: "m3",
              role: "assistant",
              content: "I understand that feeling. Work-related anxiety is very common. Let's work through this together. What specifically about work is making you anxious?",
              timestamp: new Date(Date.now() - 86200000),
              emotion: "🤗 Empathetic",
            },
          ],
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 86200000),
        },
      ],
      activeConversationId: "c1",
      isTyping: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),

      createConversation: () => {
        const id = generateId()
        const conversation: Conversation = {
          id,
          title: "New Conversation",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }))
        return id
      },

      addMessage: (conversationId, message) => {
        const newMessage: Message = { ...message, id: generateId() }
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id !== conversationId) return conv
            const updatedMessages = [...conv.messages, newMessage]
            const title = conv.messages.length === 0 && message.role === "user"
              ? message.content.slice(0, 40) + (message.content.length > 40 ? "..." : "")
              : conv.title
            return { ...conv, messages: updatedMessages, title, updatedAt: new Date() }
          }),
        }))
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id)
          const newActive = state.activeConversationId === id
            ? filtered[0]?.id ?? null
            : state.activeConversationId
          return { conversations: filtered, activeConversationId: newActive }
        })
      },

      setTyping: (typing) => set({ isTyping: typing }),
    }),
    {
      name: "mannsetu-chat",
      partialize: (state) => ({ conversations: state.conversations, activeConversationId: state.activeConversationId }),
    }
  )
)
