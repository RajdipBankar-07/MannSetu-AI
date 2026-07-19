"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  TrendingUp,
  Flame,
  Target,
  MessageCircle,
  BookOpen,
  Wind,
  Smile,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Activity,
  Brain,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect } from "react"
import { useAuthStore } from "@/store/auth"
import { useMoodStore } from "@/store/mood"
import { useAIWellnessStore } from "@/store/ai-wellness"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { getMoodEmoji, getMoodLabel, getWellnessScoreColor } from "@/lib/utils"

const weeklyData = [
  { day: "Mon", mood: 7, wellness: 72 },
  { day: "Tue", mood: 8, wellness: 75 },
  { day: "Wed", mood: 6, wellness: 68 },
  { day: "Thu", mood: 9, wellness: 82 },
  { day: "Fri", mood: 7, wellness: 76 },
  { day: "Sat", mood: 8, wellness: 79 },
  { day: "Sun", mood: 8, wellness: 78 },
]

const dailyGoals = [
  { id: 1, label: "Morning meditation (10 min)", done: true },
  { id: 2, label: "Log mood", done: true },
  { id: 3, label: "Journal entry", done: false },
  { id: 4, label: "Breathing exercise", done: false },
  { id: 5, label: "Gratitude practice", done: true },
]

const aiRecommendations = [
  {
    icon: Wind,
    title: "Try 4-7-8 Breathing",
    desc: "Your stress levels were elevated yesterday. A 10-minute session can help.",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    href: "/dashboard/meditation",
  },
  {
    icon: BookOpen,
    title: "Write in your journal",
    desc: "You haven't journaled in 2 days. Reflection helps process emotions.",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    href: "/dashboard/journal",
  },
  {
    icon: Brain,
    title: "CBT Exercise",
    desc: "Challenge negative thought patterns with guided cognitive behavioral therapy.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    href: "/dashboard/resources",
  },
]

const upcomingTasks = [
  { time: "09:00 AM", task: "Morning Mindfulness", type: "meditation" },
  { time: "12:30 PM", task: "Mood Check-in", type: "mood" },
  { time: "03:00 PM", task: "Breathing Break", type: "breathing" },
  { time: "08:00 PM", task: "Evening Journal", type: "journal" },
]

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { todayMood } = useMoodStore()
  const { recommendations, fetchRecommendations, fetchWellnessHistory } = useAIWellnessStore()

  useEffect(() => {
    fetchWellnessHistory()
  }, [])

  useEffect(() => {
    if (todayMood) {
      fetchRecommendations(todayMood.mood, todayMood.label, todayMood.note)
    } else {
      fetchRecommendations(6, "Neutral", "Feeling okay")
    }
  }, [todayMood])

  const completedGoals = dailyGoals.filter((g) => g.done).length
  const goalsProgress = (completedGoals / dailyGoals.length) * 100
  const wellnessColor = getWellnessScoreColor(user?.wellnessScore ?? 0)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  // Dynamic AI recommendations mapper
  const activeRecommendations = recommendations ? [
    ...(recommendations.meditation || []).map((m: any) => ({
      icon: Wind,
      title: m.name,
      desc: m.desc,
      color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      href: "/dashboard/meditation"
    })),
    ...(recommendations.games || []).map((g: any) => ({
      icon: Brain,
      title: `Play ${g.name}`,
      desc: g.mood_benefit,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      href: `/games/${g.game_id.replace(/_/g, "-")}`
    })),
    ...(recommendations.journal || []).map((j: any) => ({
      icon: BookOpen,
      title: "Write in Daily Journal",
      desc: j.prompt,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      href: "/dashboard/journal"
    }))
  ].slice(0, 3) : aiRecommendations

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Welcome Banner */}
      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">{greeting}! 👋</p>
                <h1 className="text-2xl font-bold mt-1">{user?.name}</h1>
                <p className="text-white/80 text-sm mt-1">
                  You&apos;re on a{" "}
                  <span className="font-semibold text-white">
                    {user?.streak}-day streak
                  </span>{" "}
                  — keep it going! 🔥
                </p>
              </div>
              <Avatar className="w-14 h-14 border-2 border-white/30">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-primary bg-white text-base font-bold">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="glass"
                size="sm"
                asChild
                className="text-white border-white/30"
              >
                <Link href="/dashboard/chat">
                  <MessageCircle className="w-4 h-4" />
                  Chat with AI
                </Link>
              </Button>
              <Button
                variant="glass"
                size="sm"
                asChild
                className="text-white border-white/30"
              >
                <Link href="/dashboard/mood">
                  <Smile className="w-4 h-4" />
                  Log Mood
                </Link>
              </Button>
              <Button
                variant="glass"
                size="sm"
                asChild
                className="text-white border-white/30"
              >
                <Link href="/dashboard/journal">
                  <BookOpen className="w-4 h-4" />
                  Journal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wellness Score */}
        <motion.div variants={fadeUp}>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Wellness Score
                </p>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold" style={{ color: wellnessColor }}>
                  {user?.wellnessScore}
                </span>
                <span className="text-sm text-muted-foreground mb-1">/100</span>
              </div>
              <Progress value={user?.wellnessScore} className="h-1.5 mt-2" />
              <p className="text-xs text-[#22C55E] mt-2">↑ 5 pts from last week</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Today */}
        <motion.div variants={fadeUp}>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mood Today
                </p>
                <Smile className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {getMoodEmoji(todayMood?.mood ?? 7)}
                </span>
                <div>
                  <p className="font-semibold">{getMoodLabel(todayMood?.mood ?? 7)}</p>
                  <p className="text-xs text-muted-foreground">
                    {todayMood?.mood ?? 7}/10
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/mood"
                className="text-xs text-primary hover:underline mt-2 block"
              >
                Update mood →
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak */}
        <motion.div variants={fadeUp}>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Daily Streak
                </p>
                <Flame className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-[#F59E0B]">
                  {user?.streak}
                </span>
                <span className="text-sm text-muted-foreground mb-1">days</span>
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < (user?.streak ?? 0) % 7 ? "bg-[#F59E0B]" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Personal best: 21 days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Goals */}
        <motion.div variants={fadeUp}>
          <Card className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Daily Goals
                </p>
                <Target className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-primary">
                  {completedGoals}
                </span>
                <span className="text-sm text-muted-foreground mb-1">
                  /{dailyGoals.length} done
                </span>
              </div>
              <Progress value={goalsProgress} className="h-1.5 mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {dailyGoals.length - completedGoals} tasks remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Progress Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Weekly Progress
                </CardTitle>
                <Badge variant="purple" className="text-xs">This Week</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="wellnessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    fill="url(#moodGrad)"
                    name="Mood"
                  />
                  <Area
                    type="monotone"
                    dataKey="wellness"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fill="url(#wellnessGrad)"
                    name="Wellness"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                  Mood Score
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                  Wellness Score
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Goals */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Daily Goals
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {completedGoals}/{dailyGoals.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {dailyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  <CheckCircle
                    className={`w-5 h-5 shrink-0 ${
                      goal.done ? "text-[#22C55E]" : "text-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      goal.done ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {goal.label}
                  </span>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-primary text-sm mt-2" asChild>
                <Link href="/dashboard/wellness">
                  View wellness plan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRecommendations.map((rec) => {
                const Icon = rec.icon
                return (
                  <Link
                    key={rec.title}
                    href={rec.href}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${rec.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{rec.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Upcoming Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.task} className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground font-mono w-20 shrink-0">
                    {task.time}
                  </div>
                  <div className="flex-1 text-sm">{task.task}</div>
                  <Badge
                    variant={
                      task.type === "meditation"
                        ? "cyan"
                        : task.type === "mood"
                        ? "warning"
                        : task.type === "breathing"
                        ? "purple"
                        : "success"
                    }
                    className="text-[10px] px-2"
                  >
                    {task.type}
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-primary text-sm" asChild>
                <Link href="/dashboard/wellness">
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  Full Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: MessageCircle, label: "AI Chat", href: "/dashboard/chat", color: "from-[#4F46E5] to-[#818CF8]" },
            { icon: Wind, label: "Meditate", href: "/dashboard/meditation", color: "from-[#06B6D4] to-[#38BDF8]" },
            { icon: BookOpen, label: "Journal", href: "/dashboard/journal", color: "from-[#22C55E] to-[#4ADE80]" },
            { icon: Smile, label: "Mood Check", href: "/dashboard/mood", color: "from-[#F59E0B] to-[#FCD34D]" },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.label} href={action.href}>
                <div className="rounded-2xl border bg-card p-4 text-center card-hover group cursor-pointer">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{action.label}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
