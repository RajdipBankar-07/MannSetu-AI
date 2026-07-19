"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Sparkles, TrendingUp, Calendar, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useMoodStore } from "@/store/mood"
import { toast } from "@/hooks/use-toast"
import { getMoodColor, getMoodLabel, formatDate } from "@/lib/utils"

const moodOptions = [
  { emoji: "😄", label: "Excellent", value: 9 },
  { emoji: "😊", label: "Good", value: 7 },
  { emoji: "😐", label: "Neutral", value: 5 },
  { emoji: "😔", label: "Low", value: 3 },
  { emoji: "😢", label: "Very Low", value: 1 },
]

const aiInsights = [
  "Your mood tends to peak on Thursdays — consider scheduling important tasks then.",
  "You logged 'stressed' 4 times this week, often after work hours. Try the 4-7-8 breathing technique.",
  "Your best moods correlate with journal entries mentioning exercise or social connection.",
  "Weekend mood scores are consistently 2 points higher than weekdays.",
]

export default function MoodPage() {
  const { entries, addEntry, getWeeklyMoods } = useMoodStore()
  const [selectedMood, setSelectedMood] = useState<typeof moodOptions[0] | null>(null)
  const [note, setNote] = useState("")
  const [logOpen, setLogOpen] = useState(false)
  const weeklyMoods = getWeeklyMoods()

  const weeklyData = weeklyMoods.map((e) => ({
    day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
    mood: e.mood,
    color: getMoodColor(e.mood),
  }))

  const monthlyData = entries.map((e, i) => ({
    date: i + 1,
    mood: e.mood,
  }))

  // Heatmap data (last 12 weeks × 7 days)
  const heatmapData = Array.from({ length: 12 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const index = week * 7 + day
      const entry = entries[index]
      return entry ? entry.mood : 0
    })
  )

  const avgMood = weeklyMoods.reduce((acc, e) => acc + e.mood, 0) / weeklyMoods.length

  const handleLogMood = () => {
    if (!selectedMood) {
      toast({ title: "Please select a mood first", variant: "destructive" })
      return
    }
    addEntry({
      date: new Date().toISOString().split("T")[0],
      mood: selectedMood.value,
      emoji: selectedMood.emoji,
      label: selectedMood.label,
      note,
      tags: note.split(" ").filter((w) => w.startsWith("#")).map((t) => t.slice(1)),
    })
    toast({ title: "Mood logged! 🎉", description: `Feeling ${selectedMood.label.toLowerCase()} today.` })
    setLogOpen(false)
    setSelectedMood(null)
    setNote("")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mood Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your emotional patterns and gain insights
          </p>
        </div>
        <Button variant="gradient" onClick={() => setLogOpen(true)} id="log-mood-btn">
          <Plus className="w-4 h-4" />
          Log Mood
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Weekly Avg", value: avgMood.toFixed(1), suffix: "/10", color: getMoodColor(avgMood) },
          { label: "Best Day", value: "Thursday", suffix: "", color: "#22C55E" },
          { label: "Logged Days", value: entries.length.toString(), suffix: " days", color: "#4F46E5" },
          { label: "Current Streak", value: "7", suffix: " days", color: "#F59E0B" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="weekly">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>
          <Badge variant="purple" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending Up
          </Badge>
        </div>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Mood Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [`${value}/10`, "Mood"]}
                  />
                  <Bar dataKey="mood" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Mood Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} label={{ value: "Day", position: "insideBottom" }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">3-Month Mood Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {heatmapData.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((mood, dayIdx) => (
                      <div
                        key={dayIdx}
                        className="w-4 h-4 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50"
                        style={{
                          backgroundColor: mood
                            ? getMoodColor(mood)
                            : "hsl(var(--muted))",
                          opacity: mood ? 0.3 + (mood / 10) * 0.7 : 0.2,
                        }}
                        title={mood ? `Mood: ${mood}/10` : "No data"}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <span>Less</span>
                {[1, 3, 5, 7, 9].map((v) => (
                  <div
                    key={v}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: getMoodColor(v), opacity: 0.3 + (v / 10) * 0.7 }}
                  />
                ))}
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                <span className="text-2xl">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{entry.label}</span>
                    <span className="text-xs text-muted-foreground">— {entry.mood}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{entry.note}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(entry.date)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Log Mood Dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How are you feeling right now?</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="flex justify-center gap-3">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMood(option)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${
                    selectedMood?.value === option.value
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-transparent"
                  }`}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-xs text-muted-foreground">{option.label}</span>
                </button>
              ))}
            </div>
            {selectedMood && (
              <div className="text-center">
                <Badge style={{ backgroundColor: `${getMoodColor(selectedMood.value)}20`, color: getMoodColor(selectedMood.value) }}>
                  {getMoodLabel(selectedMood.value)} — {selectedMood.value}/10
                </Badge>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add a note (optional)</label>
              <Textarea
                placeholder="What's on your mind? Use #tags to categorize..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleLogMood}>
              Save Mood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
