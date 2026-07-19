import { create } from "zustand"

interface FloatingAssistantState {
  isOpen: boolean
  isMinimized: boolean
  toggle: () => void
  open: () => void
  close: () => void
  minimize: () => void
  maximize: () => void
}

export const useFloatingAssistantStore = create<FloatingAssistantState>((set) => ({
  isOpen: false,
  isMinimized: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen, isMinimized: false })),
  open: () => set({ isOpen: true, isMinimized: false }),
  close: () => set({ isOpen: false }),
  minimize: () => set({ isMinimized: true }),
  maximize: () => set({ isMinimized: false }),
}))
