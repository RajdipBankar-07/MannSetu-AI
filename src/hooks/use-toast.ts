import { useState, useEffect } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

let count = 0
const listeners = new Set<(toasts: ToastProps[]) => void>()
let toasts: ToastProps[] = []

export function toast({ title, description, variant = "default" }: Omit<ToastProps, "id">) {
  const id = `toast-${count++}`
  const newToast = { id, title, description, variant }
  toasts = [...toasts, newToast]
  listeners.forEach((listener) => listener(toasts))
  
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(toasts))
  }, 3000)
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<ToastProps[]>([])

  useEffect(() => {
    setCurrentToasts(toasts)
    listeners.add(setCurrentToasts)
    return () => {
      listeners.delete(setCurrentToasts)
    }
  }, [])

  return { toasts: currentToasts, toast }
}
