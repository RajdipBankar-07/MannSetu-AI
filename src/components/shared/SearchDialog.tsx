"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MessageCircle, BarChart3, BookOpen, Smile, Wind, Users, Library } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const searchItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3, category: "Pages" },
  { label: "AI Chat", href: "/dashboard/chat", icon: MessageCircle, category: "Pages" },
  { label: "Mood Tracker", href: "/dashboard/mood", icon: Smile, category: "Pages" },
  { label: "Journal", href: "/dashboard/journal", icon: BookOpen, category: "Pages" },
  { label: "Meditation", href: "/dashboard/meditation", icon: Wind, category: "Pages" },
  { label: "Community", href: "/dashboard/community", icon: Users, category: "Pages" },
  { label: "Resources", href: "/dashboard/resources", icon: Library, category: "Pages" },
  { label: "How to track mood", href: "/dashboard/mood", icon: Smile, category: "Help" },
  { label: "Start breathing exercise", href: "/dashboard/meditation", icon: Wind, category: "Quick Actions" },
  { label: "Write in journal", href: "/dashboard/journal", icon: BookOpen, category: "Quick Actions" },
]

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const filtered = searchItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof searchItems>)

  const handleSelect = (href: string) => {
    router.push(href)
    onOpenChange(false)
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search pages, actions, help..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 px-0 text-base"
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </p>
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded border bg-background font-mono text-[10px]">↑↓</kbd>
          navigate
          <kbd className="px-1.5 py-0.5 rounded border bg-background font-mono text-[10px]">↵</kbd>
          select
          <kbd className="px-1.5 py-0.5 rounded border bg-background font-mono text-[10px]">esc</kbd>
          close
        </div>
      </DialogContent>
    </Dialog>
  )
}
