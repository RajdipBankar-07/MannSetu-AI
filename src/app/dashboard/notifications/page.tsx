"use client"

import { useState } from "react"
import { Bell, CheckCheck, Sparkles, Heart, Users, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatRelativeTime } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  description: string
  type: "reminder" | "achievement" | "community" | "ai" | "system"
  read: boolean
  createdAt: string
}

const initialNotifications: Notification[] = [
  { id: "n1", title: "Mood Check-in Reminder", description: "It's been 24 hours since your last mood log. How are you feeling today?", type: "reminder", read: false, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: "n2", title: "🎉 7-Day Meditation Streak!", description: "You've meditated every day for 7 days. Keep going — you're building a powerful habit!", type: "achievement", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "n3", title: "Community Reply", description: "KindnessFirst replied to your anonymous post: 'That really resonated with me...'", type: "community", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "n4", title: "AI Insight Ready", description: "Your weekly mood pattern analysis is ready. Your mood improved 12% this week!", type: "ai", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "n5", title: "Wellness Goal Achieved", description: "You completed all 5 morning routine tasks today. Excellent consistency!", type: "achievement", read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "n6", title: "New Resource Available", description: "'Managing Work Anxiety' — a new article tailored to your recent journal themes", type: "ai", read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
]

const typeConfig = {
  reminder: { icon: Bell, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", badge: "warning" as const },
  achievement: { icon: Target, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", badge: "success" as const },
  community: { icon: Users, color: "text-[#4F46E5]", bg: "bg-[#4F46E5]/10", badge: "purple" as const },
  ai: { icon: Sparkles, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10", badge: "cyan" as const },
  system: { icon: Heart, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", badge: "danger" as const },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unread = notifications.filter((n) => !n.read)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const NotificationItem = ({ n }: { n: Notification }) => {
    const config = typeConfig[n.type]
    const Icon = config.icon
    return (
      <div
        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-muted ${!n.read ? "border-primary/20 bg-primary/5" : ""}`}
        onClick={() => markRead(n.id)}
      >
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm">{n.title}</p>
            {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{n.description}</p>
          <p className="text-xs text-muted-foreground mt-1.5">{formatRelativeTime(n.createdAt)}</p>
        </div>
        <Badge variant={config.badge} className="text-xs shrink-0">
          {n.type}
        </Badge>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unread.length} unread notifications
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Unread", value: unread.length, icon: Bell, color: "text-primary" },
          { label: "Achievements", value: notifications.filter(n => n.type === "achievement").length, icon: Target, color: "text-[#22C55E]" },
          { label: "AI Insights", value: notifications.filter(n => n.type === "ai").length, icon: Sparkles, color: "text-[#06B6D4]" },
          { label: "Community", value: notifications.filter(n => n.type === "community").length, icon: Users, color: "text-[#4F46E5]" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-3 text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="unread">
        <TabsList>
          <TabsTrigger value="unread">
            Unread
            {unread.length > 0 && (
              <Badge variant="default" className="ml-1.5 text-[10px] px-1.5 py-0">
                {unread.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="mt-4">
          {unread.length > 0 ? (
            <div className="space-y-2">
              {unread.map((n) => <NotificationItem key={n.id} n={n} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCheck className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No unread notifications</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-2">
            {notifications.map((n) => <NotificationItem key={n.id} n={n} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
