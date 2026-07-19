import { create } from "zustand"
import { persist } from "zustand/middleware"
import { generateId } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  wellnessScore: number
  streak: number
  joinedAt: string
  plan: "free" | "pro" | "enterprise"
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const mockUser: User = {
  id: "u1",
  name: "Priya Sharma",
  email: "priya@example.com",
  wellnessScore: 78,
  streak: 12,
  joinedAt: "2024-01-15T00:00:00Z",
  plan: "pro",
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,

      login: async (email: string, _password: string) => {
        set({ isLoading: true })
        await new Promise((resolve) => setTimeout(resolve, 1000))
        set({
          user: { ...mockUser, email },
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },
    }),
    { name: "mannsetu-auth" }
  )
)
