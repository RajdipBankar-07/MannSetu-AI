"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight, Smile, Heart, ShieldAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/store/auth"
import { useMoodStore } from "@/store/mood"
import { toast } from "@/hooks/use-toast"

const moodCards = [
  { id: "happy", label: "Happy", emoji: "😊", color: "hover:bg-yellow-50 dark:hover:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/30" },
  { id: "calm", label: "Calm", emoji: "😌", color: "hover:bg-teal-50 dark:hover:bg-teal-950/20 border-teal-100 dark:border-teal-900/30" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "hover:bg-slate-50 dark:hover:bg-slate-950/20 border-slate-100 dark:border-slate-900/30" },
  { id: "worried", label: "Worried", emoji: "😟", color: "hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-100 dark:border-blue-900/30" },
  { id: "stressed", label: "Stressed", emoji: "😣", color: "hover:bg-orange-50 dark:hover:bg-orange-950/20 border-orange-100 dark:border-orange-900/30" },
  { id: "sad", label: "Sad", emoji: "😢", color: "hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30" },
  { id: "angry", label: "Angry", emoji: "😡", color: "hover:bg-red-50 dark:hover:bg-red-950/20 border-red-100 dark:border-red-900/30" },
  { id: "tired", label: "Tired", emoji: "😴", color: "hover:bg-purple-50 dark:hover:bg-purple-950/20 border-purple-100 dark:border-purple-900/30" },
  { id: "other", label: "Other", emoji: "❤️", color: "hover:bg-pink-50 dark:hover:bg-pink-950/20 border-pink-100 dark:border-pink-900/30" },
]

export default function WelcomeAIPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [step, setStep] = useState(1) // 1: Mood card, 2: Textarea, 3: Analyzing
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()
  const { addEntry } = useMoodStore()
  const router = useRouter()

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId)
    setStep(2)
  }

  const handleAnalyzeAndSubmit = async () => {
    setStep(3)
    setIsSubmitting(true)

    // Log mood score mapping
    const moodScoreMap: Record<string, number> = {
      happy: 9, calm: 8, neutral: 6, worried: 4, stressed: 3, sad: 2, angry: 2, tired: 5, other: 6
    }
    const finalScore = moodScoreMap[selectedMood || "neutral"]

    try {
      // Call backend GoEmotions analyzer
      const response = await fetch("/api/emotion/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Inject authorization header if stored locally, otherwise fallback
          "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
        },
        body: JSON.stringify({ text: note || `I feel ${selectedMood}` }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Save mood in client store
        addEntry({
          date: new Date().toISOString().split("T")[0],
          mood: data.suggested_mood_score,
          emoji: moodCards.find(m => m.id === selectedMood)?.emoji || "😐",
          label: data.primary_emotion,
          note: note,
          tags: [selectedMood || "general"],
        })

        toast({
          title: "AI Analysis Complete",
          description: `Detected emotion: ${data.primary_emotion}. Logging wellness entry.`,
        })
      } else {
        throw new Error("Backend offline")
      }
    } catch (err) {
      console.warn("FastAPI offline, saving locally in offline state.", err)
      // Save locally
      addEntry({
        date: new Date().toISOString().split("T")[0],
        mood: finalScore,
        emoji: moodCards.find(m => m.id === selectedMood)?.emoji || "😐",
        label: (selectedMood || "Neutral").charAt(0).toUpperCase() + (selectedMood || "neutral").slice(1),
        note: note,
        tags: [selectedMood || "general"],
      })
    } finally {
      setIsSubmitting(false)
      // Transition to dashboard
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Mood Cards Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Private AI Welcome
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Hi 👋 Welcome back.
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                  How are you feeling today?
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {moodCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleMoodSelect(card.id)}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${card.color}`}
                  >
                    <span className="text-3xl sm:text-4xl mb-2 select-none">{card.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{card.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Custom Text Area */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="text-4xl">{moodCards.find(m => m.id === selectedMood)?.emoji}</div>
                <h2 className="text-2xl font-bold text-foreground">
                  Would you like to tell me more?
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Sharing detail about your day helps our GoEmotions AI engine customize your mental health prompts and recommendations.
                </p>
              </div>

              <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4 space-y-4">
                  <Textarea
                    placeholder="Write down any thoughts, stress triggers, or highlights of today..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[150px] resize-none border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground text-base leading-relaxed"
                  />
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="rounded-full px-5 text-muted-foreground hover:bg-muted"
                    >
                      Back
                    </Button>
                    <Button
                      variant="gradient"
                      onClick={handleAnalyzeAndSubmit}
                      className="rounded-full px-6"
                    >
                      Analyze & Continue
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Analyzing State */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center space-y-6 py-12 text-center"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full bg-gradient-brand flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">AI is listening...</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  GoEmotions is analyzing your sentiment to map stress, anxiety, or joy levels. Saving details to MongoDB.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
