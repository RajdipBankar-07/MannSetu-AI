"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Circle, Bell, Sun, Sunset, Moon, Plus, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

interface Task {
  id: string
  label: string
  duration: string
  done: boolean
  category: "morning" | "afternoon" | "evening"
}

const initialTasks: Task[] = [
  { id: "t1", label: "5-minute body scan meditation", duration: "5 min", done: true, category: "morning" },
  { id: "t2", label: "Set 3 intentions for the day", duration: "2 min", done: true, category: "morning" },
  { id: "t3", label: "Gratitude journaling (3 things)", duration: "5 min", done: false, category: "morning" },
  { id: "t4", label: "Drink 2 glasses of water", duration: "—", done: true, category: "morning" },
  { id: "t5", label: "20-minute walk or light exercise", duration: "20 min", done: false, category: "morning" },

  { id: "t6", label: "Mood check-in", duration: "1 min", done: true, category: "afternoon" },
  { id: "t7", label: "Mindful eating at lunch", duration: "15 min", done: false, category: "afternoon" },
  { id: "t8", label: "5-minute breathing break", duration: "5 min", done: false, category: "afternoon" },
  { id: "t9", label: "Step away from screens", duration: "10 min", done: true, category: "afternoon" },

  { id: "t10", label: "Digital sunset (no screens 1hr before bed)", duration: "—", done: false, category: "evening" },
  { id: "t11", label: "Reflection journal", duration: "10 min", done: false, category: "evening" },
  { id: "t12", label: "Progressive muscle relaxation", duration: "15 min", done: false, category: "evening" },
  { id: "t13", label: "Prepare tomorrow's intentions", duration: "5 min", done: false, category: "evening" },
]

const reminders = [
  { label: "Morning wellness reminder", time: "07:30 AM", enabled: true },
  { label: "Mood check-in", time: "12:00 PM", enabled: true },
  { label: "Breathing break", time: "03:00 PM", enabled: false },
  { label: "Evening journal", time: "09:00 PM", enabled: true },
]

export default function WellnessPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [reminderStates, setReminderStates] = useState(reminders.map((r) => r.enabled))

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const toggleReminder = (index: number) => {
    setReminderStates((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      toast({ title: `Reminder ${next[index] ? "enabled" : "disabled"}` })
      return next
    })
  }

  const categories = [
    { key: "morning", label: "Morning Routine", icon: Sun, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
    { key: "afternoon", label: "Afternoon Routine", icon: Sunset, color: "text-[#4F46E5]", bg: "bg-[#4F46E5]/10" },
    { key: "evening", label: "Evening Routine", icon: Moon, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  ] as const

  const totalDone = tasks.filter((t) => t.done).length
  const totalProgress = (totalDone / tasks.length) * 100

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wellness Plan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your personalized daily wellness routines
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-brand text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">Today&apos;s Progress</p>
              <p className="text-3xl font-bold mt-1">
                {totalDone}/{tasks.length}{" "}
                <span className="text-xl font-medium text-white/80">tasks</span>
              </p>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="white" strokeWidth="2.5"
                  strokeDasharray={`${totalProgress} ${100 - totalProgress}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{Math.round(totalProgress)}%</span>
              </div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-2 bg-white/20 [&>div]:bg-white" />
          <p className="text-white/70 text-xs mt-2">
            {tasks.length - totalDone} tasks remaining today
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Task Lists */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="morning">
            <TabsList className="w-full">
              {categories.map((cat) => {
                const Icon = cat.icon
                const catTasks = tasks.filter((t) => t.category === cat.key)
                const catDone = catTasks.filter((t) => t.done).length
                return (
                  <TabsTrigger key={cat.key} value={cat.key} className="flex-1">
                    <Icon className="w-4 h-4 mr-1.5" />
                    {cat.label.split(" ")[0]}
                    <Badge variant="outline" className="ml-1.5 text-[10px] px-1 py-0">
                      {catDone}/{catTasks.length}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {categories.map((cat) => {
              const Icon = cat.icon
              const catTasks = tasks.filter((t) => t.category === cat.key)
              const catDone = catTasks.filter((t) => t.done).length
              return (
                <TabsContent key={cat.key} value={cat.key}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${cat.color}`} />
                          </div>
                          {cat.label}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">{catDone}/{catTasks.length} completed</span>
                      </div>
                      <Progress value={(catDone / catTasks.length) * 100} className="h-1.5" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {catTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          layout
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            task.done
                              ? "border-[#22C55E]/30 bg-[#22C55E]/5"
                              : "border-transparent hover:border-border hover:bg-muted"
                          }`}
                          onClick={() => toggleTask(task.id)}
                        >
                          {task.done ? (
                            <CheckCircle className="w-5 h-5 text-[#22C55E] shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                          )}
                          <span className={`text-sm flex-1 ${task.done ? "line-through text-muted-foreground" : ""}`}>
                            {task.label}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">{task.duration}</Badge>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Daily Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reminders.map((reminder, index) => (
                <div key={reminder.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{reminder.label}</p>
                    <p className="text-xs text-muted-foreground">{reminder.time}</p>
                  </div>
                  <Switch
                    checked={reminderStates[index]}
                    onCheckedChange={() => toggleReminder(index)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "You complete morning tasks 85% of the time — great consistency!",
                "Adding 5 minutes of cold water exposure in the morning can boost alertness.",
                "Your evening routine is lighter than optimal. Consider adding journaling.",
              ].map((tip, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground leading-relaxed">
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
