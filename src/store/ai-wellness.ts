import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface WellnessRecord {
  id?: string
  wellness_score: number
  primary_emotion?: string
  timestamp: string
  breakdown?: {
    mood_avg: number
    journal_count: number
    meditation_count: number
    game_count: number
  }
}

interface AIWellnessState {
  latestWellness: WellnessRecord | null
  history: WellnessRecord[]
  recommendations: any | null
  isLoading: boolean
  fetchWellnessHistory: () => Promise<void>
  recalculateWellnessScore: () => Promise<void>
  fetchRecommendations: (moodScore: number, emotion: string, note: string) => Promise<void>
}

export const useAIWellnessStore = create<AIWellnessState>()(
  persist(
    (set, get) => ({
      latestWellness: null,
      history: [],
      recommendations: null,
      isLoading: false,

      fetchWellnessHistory: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch("/api/wellness/history", {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            set({
              history: data,
              latestWellness: data[0] || null,
              isLoading: false
            })
          } else {
            throw new Error("Failed to load history")
          }
        } catch (e) {
          console.warn("Failed to load wellness history from backend, keeping cached state", e)
          set({ isLoading: false })
        }
      },

      recalculateWellnessScore: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch("/api/wellness", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
            }
          })
          if (response.ok) {
            await get().fetchWellnessHistory()
          }
        } catch (e) {
          console.error("Failed to recalculate wellness score", e)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchRecommendations: async (moodScore, emotion, note) => {
        set({ isLoading: true })
        try {
          const response = await fetch("/api/recommendations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
            },
            body: JSON.stringify({
              mood_score: moodScore,
              primary_emotion: emotion,
              mood_note: note
            })
          })
          if (response.ok) {
            const data = await response.json()
            set({ recommendations: data })
          }
        } catch (e) {
          console.error("Failed to fetch recommendations", e)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: "mannsetu-ai-wellness",
      partialize: (state) => ({ latestWellness: state.latestWellness, history: state.history, recommendations: state.recommendations })
    }
  )
)
