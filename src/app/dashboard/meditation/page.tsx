"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Volume2, VolumeX, Headphones } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"

const categories = [
  { label: "All", value: "all" },
  { label: "Breathing", value: "breathing" },
  { label: "Body Scan", value: "body-scan" },
  { label: "Sleep", value: "sleep" },
  { label: "Focus", value: "focus" },
  { label: "Anxiety", value: "anxiety" },
]

const sessions = [
  { id: 1, title: "4-7-8 Breathing", category: "breathing", duration: 480, description: "Calming breath pattern for anxiety relief", level: "Beginner", color: "from-[#06B6D4] to-[#0EA5E9]" },
  { id: 2, title: "Morning Body Scan", category: "body-scan", duration: 600, description: "Start your day with full body awareness", level: "Beginner", color: "from-[#22C55E] to-[#10B981]" },
  { id: 3, title: "Sleep Preparation", category: "sleep", duration: 900, description: "Gentle relaxation before bedtime", level: "All levels", color: "from-[#4F46E5] to-[#7C3AED]" },
  { id: 4, title: "Anxiety Release", category: "anxiety", duration: 720, description: "Grounding techniques for anxious moments", level: "Intermediate", color: "from-[#F59E0B] to-[#EF4444]" },
  { id: 5, title: "Focus Flow", category: "focus", duration: 1200, description: "Deep work preparation meditation", level: "Advanced", color: "from-[#8B5CF6] to-[#EC4899]" },
  { id: 6, title: "Box Breathing", category: "breathing", duration: 300, description: "Navy SEAL technique for stress control", level: "All levels", color: "from-[#06B6D4] to-[#22C55E]" },
]

const breathPhases = ["Inhale", "Hold", "Exhale", "Hold"]
const breathDurations = [4, 7, 8, 4]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export default function MeditationPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeSession, setActiveSession] = useState(sessions[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(sessions[0].duration)
  const [volume, setVolume] = useState([70])
  const [isMuted, setIsMuted] = useState(false)
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathProgress, setBreathProgress] = useState(0)
  const [totalSessions, setTotalSessions] = useState(12)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filtered = selectedCategory === "all"
    ? sessions
    : sessions.filter((s) => s.category === selectedCategory)

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false)
            setTotalSessions((n) => n + 1)
            toast({ title: "Session complete! 🧘", description: "Great job! Your mindfulness is growing." })
            return activeSession.duration
          }
          return prev - 1
        })
      }, 1000)

      // Breath animation
      let phaseTime = 0
      let currentPhase = breathPhase
      breathRef.current = setInterval(() => {
        phaseTime++
        const phaseDuration = breathDurations[currentPhase]
        setBreathProgress((phaseTime / phaseDuration) * 100)
        if (phaseTime >= phaseDuration) {
          phaseTime = 0
          currentPhase = (currentPhase + 1) % 4
          setBreathPhase(currentPhase)
        }
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (breathRef.current) clearInterval(breathRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (breathRef.current) clearInterval(breathRef.current)
    }
  }, [isPlaying, activeSession.duration, breathPhase])

  const handleSelectSession = (session: typeof sessions[0]) => {
    setActiveSession(session)
    setTimeLeft(session.duration)
    setIsPlaying(false)
    setBreathPhase(0)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setTimeLeft(activeSession.duration)
    setBreathPhase(0)
    setBreathProgress(0)
  }

  const progress = ((activeSession.duration - timeLeft) / activeSession.duration) * 100

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meditation</h1>
        <p className="text-muted-foreground text-sm mt-1">Guided sessions for every mood and moment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Sessions This Week", value: "5", color: "text-primary" },
          { label: "Total Minutes", value: "142", color: "text-[#22C55E]" },
          { label: "Total Sessions", value: totalSessions.toString(), color: "text-[#F59E0B]" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  activeSession.id === session.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "hover:border-border/80 hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center shrink-0`}>
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{session.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{session.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {formatTime(session.duration)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{session.level}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold">{activeSession.title}</h2>
                <p className="text-muted-foreground text-sm mt-1">{activeSession.description}</p>
              </div>

              {/* Breathing Animation */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  {/* Progress ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="46"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray={`${progress * 2.89} 289`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  {/* Breathing circle */}
                  <motion.div
                    animate={isPlaying ? {
                      scale: breathPhase === 0 ? 1.3 : breathPhase === 1 ? 1.3 : breathPhase === 2 ? 1 : 1,
                    } : { scale: 1 }}
                    transition={{ duration: breathDurations[breathPhase], ease: "easeInOut" }}
                    className={`w-32 h-32 rounded-full bg-gradient-to-br ${activeSession.color} opacity-80 flex items-center justify-center`}
                  >
                    <div className="text-center text-white">
                      <p className="text-sm font-semibold">{isPlaying ? breathPhases[breathPhase] : "Ready"}</p>
                      {isPlaying && (
                        <p className="text-2xl font-bold">
                          {breathDurations[breathPhase]}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {isPlaying && (
                  <div className="w-48">
                    <Progress value={breathProgress} className="h-1" />
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {breathPhases[breathPhase]} for {breathDurations[breathPhase]}s
                    </p>
                  </div>
                )}
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <p className="text-5xl font-bold font-mono tracking-wider">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatTime(activeSession.duration - timeLeft)} elapsed
                </p>
              </div>

              {/* Progress */}
              <Progress value={progress} className="h-1.5 mb-6" />

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={handleReset} aria-label="Reset">
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="icon-lg"
                  variant="gradient"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  <AnimatePresence mode="wait">
                    {isPlaying ? (
                      <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Pause className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Play className="w-6 h-6 translate-x-0.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 max-w-xs mx-auto">
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              </div>

              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <Badge variant="success" className="animate-pulse">
                    🧘 Session in progress
                  </Badge>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
