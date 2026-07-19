"use client"

import { motion } from "framer-motion"
import {
  Users,
  TrendingUp,
  TriangleAlert,
  MessageCircle,
  Shield,
  Activity,
  Brain,
  ChartColumn,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const userGrowthData = [
  { month: "Jul", users: 3200 },
  { month: "Aug", users: 4100 },
  { month: "Sep", users: 5800 },
  { month: "Oct", users: 7200 },
  { month: "Nov", users: 9400 },
  { month: "Dec", users: 12847 },
]

const moodDistribution = [
  { name: "Excellent (8-10)", value: 28, color: "#22C55E" },
  { name: "Good (6-7)", value: 42, color: "#06B6D4" },
  { name: "Neutral (4-5)", value: 18, color: "#F59E0B" },
  { name: "Low (1-3)", value: 12, color: "#EF4444" },
]

const crisisAlerts = [
  { id: "ca1", user: "User_7823", type: "Distress", severity: "High", time: "2m ago", status: "Active" },
  { id: "ca2", user: "User_4512", type: "Crisis", severity: "Critical", time: "15m ago", status: "Responded" },
  { id: "ca3", user: "User_9034", type: "Anxiety", severity: "Medium", time: "1h ago", status: "Resolved" },
]

const topMetrics = [
  { label: "Total Users", value: "12,847", change: "+32%", icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { label: "Active Today", value: "3,241", change: "+12%", icon: Activity, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
  { label: "AI Conversations", value: "28,412", change: "+45%", icon: MessageCircle, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  { label: "Crisis Alerts", value: "14", change: "-22%", icon: TriangleAlert, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
]

const stagger = { visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function AdminDashboardPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ChartColumn className="w-4 h-4 mr-1" />
            Export Report
          </Button>
          <Badge variant="danger" className="text-sm px-3 py-1">
            <TriangleAlert className="w-3.5 h-3.5 mr-1" />
            3 Active Alerts
          </Badge>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <motion.div key={metric.label} variants={fadeUp}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-xl font-bold">{metric.value}</p>
                    </div>
                  </div>
                  <Badge variant={metric.change.startsWith("+") ? "success" : "danger"} className="text-xs">
                    {metric.change} this month
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="users" stroke="#4F46E5" strokeWidth={2} fill="url(#userGrad)" name="Total Users" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Distribution */}
        <motion.div variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Platform Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={moodDistribution} cx="50%" cy="50%" outerRadius={70} paddingAngle={2} dataKey="value">
                    {moodDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {moodDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Crisis Alerts */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TriangleAlert className="w-4 h-4 text-[#EF4444]" />
                Crisis Alerts
              </CardTitle>
              <Button variant="outline" size="sm">View All Alerts</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {crisisAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-4 p-3 rounded-xl border">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    alert.severity === "Critical" ? "bg-[#EF4444]/10" : alert.severity === "High" ? "bg-[#F59E0B]/10" : "bg-[#06B6D4]/10"
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      alert.severity === "Critical" ? "text-[#EF4444]" : alert.severity === "High" ? "text-[#F59E0B]" : "text-[#06B6D4]"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{alert.user}</p>
                      <Badge variant={alert.severity === "Critical" ? "danger" : alert.severity === "High" ? "warning" : "cyan"} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.type} · {alert.time}</p>
                  </div>
                  <Badge variant={alert.status === "Active" ? "danger" : alert.status === "Responded" ? "warning" : "success"} className="text-xs">
                    {alert.status}
                  </Badge>
                  {alert.status === "Active" && (
                    <Button size="sm" variant="gradient">Respond</Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Health */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "AI Response Accuracy", value: 94, color: "#22C55E" },
                { label: "Content Moderation Rate", value: 99.8, color: "#4F46E5" },
                { label: "User Retention (30d)", value: 72, color: "#06B6D4" },
                { label: "Crisis Response Time", value: 87, color: "#F59E0B" },
              ].map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">{metric.label}</span>
                    <span className="font-bold" style={{ color: metric.color }}>{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
