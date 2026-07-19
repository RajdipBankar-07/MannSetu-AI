"use client"

import { useState } from "react"
import { Bell, Shield, Palette, Globe, Brain, Volume2, Moon, Sun } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const settingSections = [
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    settings: [
      { id: "mood-reminder", label: "Mood Check-in Reminders", desc: "Daily reminders to log your mood", defaultOn: true },
      { id: "meditation-reminder", label: "Meditation Reminders", desc: "Scheduled meditation session alerts", defaultOn: true },
      { id: "community-replies", label: "Community Replies", desc: "When someone replies to your posts", defaultOn: true },
      { id: "weekly-report", label: "Weekly Wellness Report", desc: "Summary of your progress each week", defaultOn: false },
      { id: "achievement", label: "Achievement Notifications", desc: "When you earn badges and milestones", defaultOn: true },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    icon: Shield,
    settings: [
      { id: "biometric", label: "Biometric Lock", desc: "Use fingerprint or face ID to open app", defaultOn: false },
      { id: "incognito", label: "Incognito Mode", desc: "Don't save session history", defaultOn: false },
      { id: "analytics", label: "Usage Analytics", desc: "Help improve the app with anonymous data", defaultOn: true },
    ],
  },
  {
    id: "ai",
    title: "AI Preferences",
    icon: Brain,
    settings: [
      { id: "ai-suggestions", label: "AI Suggestions", desc: "Receive personalized wellness recommendations", defaultOn: true },
      { id: "emotion-analysis", label: "Emotion Analysis in Journal", desc: "AI analyzes emotional patterns in your writing", defaultOn: true },
      { id: "crisis-detection", label: "Crisis Detection", desc: "AI monitors for signs of distress and alerts support", defaultOn: true },
    ],
  },
  {
    id: "sound",
    title: "Sound & Media",
    icon: Volume2,
    settings: [
      { id: "ambient-sounds", label: "Ambient Background Sounds", desc: "Play calming sounds during meditation", defaultOn: true },
      { id: "sound-effects", label: "App Sound Effects", desc: "UI feedback sounds", defaultOn: false },
    ],
  },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [switches, setSwitches] = useState<Record<string, boolean>>(
    settingSections.reduce((acc, section) => {
      section.settings.forEach((s) => {
        acc[s.id] = s.defaultOn
      })
      return acc
    }, {} as Record<string, boolean>)
  )

  const toggleSwitch = (id: string) => {
    setSwitches((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      toast({ title: `${id.replace(/-/g, " ")} ${next[id] ? "enabled" : "disabled"}` })
      return next
    })
  }

  const handleSave = () => {
    toast({ title: "Settings saved! ✅", description: "Your preferences have been updated." })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your preferences and account settings</p>
        </div>
        <Button variant="gradient" onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-sm font-medium mb-2 block">Theme</Label>
            <div className="flex gap-2">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Globe },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    theme === value
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-muted hover:border-border"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${theme === value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${theme === value ? "text-primary" : ""}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
                <SelectItem value="mr">Marathi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Wellness Check-in Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple">Multiple times daily</SelectItem>
                <SelectItem value="daily">Once daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Settings */}
      {settingSections.map((section) => {
        const Icon = section.icon
        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.settings.map((setting, index) => (
                <div key={setting.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <Label htmlFor={setting.id} className="text-sm font-medium cursor-pointer">
                        {setting.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                    </div>
                    <Switch
                      id={setting.id}
                      checked={switches[setting.id] ?? setting.defaultOn}
                      onCheckedChange={() => toggleSwitch(setting.id)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      {/* Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Plan</CardTitle>
            <Badge variant="purple">Pro</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">You&apos;re on the Pro plan with unlimited AI chats and advanced analytics.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">View Plan Details</Button>
            <Button variant="destructive" size="sm">Cancel Subscription</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
