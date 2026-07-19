"use client"

import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, Brain, Wind, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const weeklyMoodData = [
  { day: "Mon", mood: 6.5, sessions: 1 },
  { day: "Tue", mood: 7.2, sessions: 2 },
  { day: "Wed", mood: 6.8, sessions: 1 },
  { day: "Thu", mood: 8.1, sessions: 3 },
  { day: "Fri", mood: 7.5, sessions: 2 },
  { day: "Sat", mood: 7.8, sessions: 2 },
  { day: "Sun", mood: 8.0, sessions: 1 },
]

const monthlyWellness = [
  { week: "W1", wellness: 68, mood: 6.5 },
  { week: "W2", wellness: 72, mood: 7.0 },
  { week: "W3", wellness: 74, mood: 7.3 },
  { week: "W4", wellness: 78, mood: 7.8 },
]

const activityBreakdown = [
  { name: "AI Chat", value: 35, color: "#4F46E5" },
  { name: "Meditation", value: 25, color: "#06B6D4" },
  { name: "Journaling", value: 20, color: "#22C55E" },
  { name: "Mood Tracking", value: 15, color: "#F59E0B" },
  { name: "Resources", value: 5, color: "#EF4444" },
]

const topTags = [
  { tag: "work", count: 18 },
  { tag: "anxiety", count: 14 },
  { tag: "gratitude", count: 12 },
  { tag: "family", count: 9 },
  { tag: "sleep", count: 7 },
  { tag: "exercise", count: 6 },
]

const stats = [
  { label: "Avg Mood Score", value: "7.4/10", change: "+0.6", up: true, icon: Activity, color: "text-primary" },
  { label: "Wellness Score", value: "78/100", change: "+5", up: true, icon: TrendingUp, color: "text-[#22C55E]" },
  { label: "Stress Reduction", value: "32%", change: "+8%", up: true, icon: Brain, color: "text-[#06B6D4]" },
  { label: "Sleep Quality", value: "6.8/10", change: "-0.2", up: false, icon: Wind, color: "text-[#F59E0B]" },
]

const stagger = { visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function AnalyticsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Detailed insights into your wellness journey</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={fadeUp}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.up ? (
                      <TrendingUp className="w-3 h-3 text-[#22C55E]" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-[#EF4444]" />
                    )}
                    <span className={`text-xs ${stat.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {stat.change} this month
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts */}
      <Tabs defaultValue="mood">
        <TabsList>
          <TabsTrigger value="mood">Mood Trends</TabsTrigger>
          <TabsTrigger value="wellness">Wellness Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity Mix</TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Mood This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={weeklyMoodData}>
                    <defs>
                      <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                    <Area type="monotone" dataKey="mood" stroke="#4F46E5" strokeWidth={2} fill="url(#moodFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Journal Tags Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topTags} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="tag" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                    <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wellness" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Wellness Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyWellness}>
                  <defs>
                    <linearGradient id="wellnessFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="moodFill2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                  <Legend />
                  <Area type="monotone" dataKey="wellness" stroke="#22C55E" strokeWidth={2} fill="url(#wellnessFill)" name="Wellness Score" />
                  <Area type="monotone" dataKey="mood" stroke="#4F46E5" strokeWidth={2} fill="url(#moodFill2)" name="Avg Mood" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={activityBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {activityBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {activityBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name} ({item.value}%)
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Sessions Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyMoodData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                    <Bar dataKey="sessions" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <motion.div variants={fadeUp}>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Key Insights
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { insight: "Your mood is highest on Thursdays — schedule important tasks then.", badge: "Mood Pattern", color: "purple" },
            { insight: "Meditation sessions correlate with a 1.8x higher wellness score the next day.", badge: "Activity Impact", color: "cyan" },
            { insight: "Journal entries tagged 'gratitude' show 23% higher mood scores.", badge: "Journal Insight", color: "success" },
            { insight: "Your average screen-free time is 4.2 hours — above the wellness target.", badge: "Digital Health", color: "warning" },
            { insight: "Sleep quality has dropped slightly. Consider adding an evening wind-down routine.", badge: "Sleep Health", color: "danger" },
            { insight: "Community engagement in the past week shows positive emotional tone.", badge: "Social", color: "purple" },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl border bg-card">
              <Badge variant={item.color as "purple" | "cyan" | "success" | "warning" | "danger"} className="text-xs mb-2">{item.badge}</Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.insight}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
