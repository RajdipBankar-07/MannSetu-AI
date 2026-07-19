import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(d)
}

export function getMoodEmoji(mood: number): string {
  if (mood >= 9) return "😄"
  if (mood >= 7) return "😊"
  if (mood >= 5) return "😐"
  if (mood >= 3) return "😔"
  return "😢"
}

export function getMoodLabel(mood: number): string {
  if (mood >= 9) return "Excellent"
  if (mood >= 7) return "Good"
  if (mood >= 5) return "Neutral"
  if (mood >= 3) return "Low"
  return "Very Low"
}

export function getMoodColor(mood: number): string {
  if (mood >= 8) return "#22C55E"
  if (mood >= 6) return "#06B6D4"
  if (mood >= 4) return "#F59E0B"
  return "#EF4444"
}

export function getWellnessScoreColor(score: number): string {
  if (score >= 75) return "#22C55E"
  if (score >= 50) return "#F59E0B"
  return "#EF4444"
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}
