"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Download, Edit3, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth"
import { getInitials, formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const wellnessHistory = [
  { month: "Jul", score: 58 },
  { month: "Aug", score: 62 },
  { month: "Sep", score: 65 },
  { month: "Oct", score: 70 },
  { month: "Nov", score: 74 },
  { month: "Dec", score: 78 },
]

const achievements = [
  { emoji: "🔥", title: "Streak Master", desc: "12-day wellness streak", earned: true },
  { emoji: "🧘", title: "Mindful Month", desc: "30 meditation sessions", earned: true },
  { emoji: "📝", title: "Journal Keeper", desc: "20 journal entries", earned: true },
  { emoji: "💙", title: "Community Helper", desc: "10 helpful community posts", earned: false },
  { emoji: "🌟", title: "Wellness Champion", desc: "Score 90+ for 7 days", earned: false },
  { emoji: "🎯", title: "Goal Crusher", desc: "Complete all daily goals for 14 days", earned: false },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)

  const handleExport = () => {
    toast({ title: "Exporting data...", description: "Your wellness data will be ready shortly." })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl font-bold">
                    {getInitials(user?.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
                  onClick={() => toast({ title: "Change photo", description: "Photo upload coming soon!" })}
                  aria-label="Change profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold">{user?.name}</h1>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="purple">Pro Plan</Badge>
                      <Badge variant="success">Verified</Badge>
                      <span className="text-xs text-muted-foreground">
                        Member since {formatDate(user?.joinedAt ?? new Date().toISOString())}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    {isEditing ? "Save" : "Edit Profile"}
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Wellness Score", value: user?.wellnessScore ?? 78, suffix: "/100", color: "#22C55E" },
                { label: "Day Streak", value: user?.streak ?? 12, suffix: " days", color: "#F59E0B" },
                { label: "Journal Entries", value: 23, suffix: "", color: "#4F46E5" },
                { label: "Meditation Min", value: 142, suffix: " min", color: "#06B6D4" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}<span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Wellness History</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="data">Data Export</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wellness Score Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={wellnessHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#4F46E5" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm text-center text-[#22C55E] mt-2">
                ↑ 20 points improvement over 6 months — Excellent progress!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map((a) => (
              <Card
                key={a.title}
                className={`text-center ${!a.earned ? "opacity-50" : ""}`}
              >
                <CardContent className="p-4">
                  <div className={`text-4xl mb-2 ${!a.earned ? "grayscale" : ""}`}>{a.emoji}</div>
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                  {a.earned ? (
                    <Badge variant="success" className="mt-2 text-xs">Earned</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 text-xs">Locked</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#22C55E]" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Anonymous in Community", desc: "Your identity is hidden in all community posts", enabled: true },
                { label: "Data Analytics", desc: "Allow anonymized data to improve AI recommendations", enabled: true },
                { label: "Third-party Sharing", desc: "Share data with research partners", enabled: false },
                { label: "Marketing Communications", desc: "Receive product updates and wellness tips", enabled: false },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.desc}</p>
                  </div>
                  <Badge variant={setting.enabled ? "success" : "outline"} className="text-xs">
                    {setting.enabled ? "On" : "Off"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download a complete copy of your wellness data. Your data belongs to you.
              </p>
              {[
                { label: "All Journal Entries", size: "~2.4 MB", format: "PDF / JSON" },
                { label: "Mood History", size: "~0.8 MB", format: "CSV / JSON" },
                { label: "Chat Conversations", size: "~1.2 MB", format: "JSON" },
                { label: "Wellness Analytics", size: "~0.5 MB", format: "PDF" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.size} · {item.format}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Export
                  </Button>
                </div>
              ))}
              <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-sm text-[#EF4444]">
                <p className="font-semibold mb-1">Delete Account</p>
                <p className="text-xs opacity-80">Permanently delete your account and all associated data. This cannot be undone.</p>
                <Button variant="destructive" size="sm" className="mt-2">Delete My Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
