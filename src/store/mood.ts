import { create } from "zustand"
import { persist } from "zustand/middleware"
import { generateId } from "@/lib/utils"

export interface MoodEntry {
  id: string
  date: string
  mood: number
  emoji: string
  label: string
  note: string
  tags: string[]
}

interface MoodState {
  entries: MoodEntry[]
  todayMood: MoodEntry | null
  addEntry: (entry: Omit<MoodEntry, "id">) => void
  getWeeklyMoods: () => MoodEntry[]
}

const mockEntries: MoodEntry[] = Array.from({ length: 30 }, (_, i) => ({
  id: `m${i}`,
  date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
  mood: Math.floor(Math.random() * 4) + 5,
  emoji: ["😄", "😊", "😐", "😔"][Math.floor(Math.random() * 4)],
  label: ["Good", "Excellent", "Neutral", "Low"][Math.floor(Math.random() * 4)],
  note: "Feeling okay today.",
  tags: ["work", "family", "exercise"].slice(0, Math.floor(Math.random() * 3) + 1),
}))

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: mockEntries,
      todayMood: mockEntries[0],

      addEntry: (entry) => {
        const newEntry: MoodEntry = { ...entry, id: generateId() }
        set((state) => ({
          entries: [newEntry, ...state.entries],
          todayMood: newEntry,
        }))
      },

      getWeeklyMoods: () => {
        const { entries } = get()
        const week = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0]
          return entries.find((e) => e.date === date) ?? {
            id: `placeholder-${i}`,
            date,
            mood: 5,
            emoji: "😐",
            label: "Neutral",
            note: "",
            tags: [],
          }
        }).reverse()
        return week
      },
    }),
    { name: "mannsetu-mood" }
  )
)
