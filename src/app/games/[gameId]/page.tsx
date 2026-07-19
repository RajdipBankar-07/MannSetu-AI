"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Award, Gamepad, Star } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useAIWellnessStore } from "@/store/ai-wellness"
import {
  getGames,
  completeGame,
  submitGameFeedback,
  Game
} from "@/lib/api/games"

import GameWrapper from "@/components/games/GameWrapper"
import WellnessGamePlayer from "@/components/games/WellnessGamePlayer"

interface PageProps {
  params: Promise<{
    gameId: string
  }>
}

const routeToGameIdMap: Record<string, string> = {
  // Stress Relief
  "bubble-pop": "bubble_pop",
  "water-ripple": "water_ripple",
  "zen-sand-garden": "zen_sand_garden",
  "cloud-burst": "cloud_burst",
  "balloon-release": "balloon_release",
  "forest-walk": "forest_walk",
  "leaf-catch": "leaf_catch",
  "stone-balance": "stone_balance",
  "calm-waves": "calm_waves",

  // Anxiety Relief
  "grounding-challenge": "grounding_challenge",
  "color-match": "color_match",
  "focus-dot": "focus_dot",
  "butterfly-tap": "butterfly_tap",
  "safe-space": "safe_space",
  "calm-pulse": "calm_pulse",
  "ocean-calm": "ocean_calm",
  "mind-anchor": "mind_anchor",

  // Brain Training
  "sudoku": "sudoku",
  "chess": "chess",
  "2048": "game_2048",
  "logic-grid": "logic_grid",
  "brain-sprint": "brain_sprint",
  "math-challenge": "math_challenge",
  "pattern-builder": "pattern_builder",
  "shape-puzzle": "shape_puzzle",

  // Memory Games
  "memory-match": "memory_match",
  "picture-match": "picture_match",
  "card-flip": "card_flip",
  "simon-memory": "simon_memory",
  "object-recall": "object_recall",
  "pattern-recall": "pattern_recall",
  "emoji-match": "emoji_match",
  "flash-recall": "flash_recall",

  // Focus Games
  "reaction-trainer": "reaction_trainer",
  "maze-escape": "maze_escape",
  "target-tap": "target_tap",
  "hidden-objects": "hidden_objects",
  "laser-focus": "laser_focus",
  "precision-click": "precision_click",
  "attention-trainer": "attention_trainer",
  "quick-reflex": "quick_reflex",

  // Creativity
  "mandala-coloring": "calm_coloring",
  "digital-painting": "digital_painting",
  "pixel-art": "pixel_art",
  "creative-canvas": "creative_canvas",
  "zen-drawing": "zen_drawing",
  "mood-art": "mood_art",
  "nature-sketch": "nature_sketch",
  "sand-art": "sand_art",

  // Positive Thinking
  "virtual-plant": "plant_growing",
  "virtual-pet": "virtual_pet_care",
  "gratitude-challenge": "gratitude_challenge",
  "daily-smile": "daily_smile",
  "hope-builder": "hope_builder",
  "vision-board": "vision_board",
  "positive-quotes": "positive_quotes",
  "kindness-mission": "kindness_mission",

  // Sleep
  "sleep-story": "sleep_story",
  "moon-journey": "moon_journey",
  "night-meditation": "night_meditation",
  "dream-builder": "dream_builder",
  "star-relaxation": "star_relaxation",
  "calm-bedtime": "calm_bedtime",
  "sleep-music": "sleep_music",
  "evening-reflection": "evening_reflection",

  // Mindfulness
  "walking-meditation": "walking_meditation",
  "body-scan": "body_scan",
  "mountain-journey": "mountain_journey",
  "forest-meditation": "forest_meditation",
  "present-moment": "present_moment",
  "silent-observation": "silent_observation",
  "breath-awareness": "breath_awareness",
  "one-minute-calm": "one_minute_calm"
}

export default function GameRoutePage({ params }: PageProps) {
  const unwrappedParams = use(params)
  const { gameId } = unwrappedParams
  const router = useRouter()
  const { latestWellness } = useAIWellnessStore()

  const [currentGame, setCurrentGame] = useState<Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gameMoodBefore, setGameMoodBefore] = useState("neutral")
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<string>("Better")
  const [starRating, setStarRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    getGames()
      .then((data) => {
        const dbGameId = routeToGameIdMap[gameId] || gameId.replace(/-/g, "_")
        const found = data.find((g) => g.game_id === dbGameId)
        if (found) {
          setCurrentGame(found)
        } else {
          setCurrentGame({
            _id: gameId,
            game_id: dbGameId,
            name: gameId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            category: "Wellness",
            duration: "5 min",
            difficulty: "Easy",
            mood_benefit: "Relieves tension and improves focus.",
            xp_reward: 50,
            cover_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&h=337&auto=format&fit=crop",
            completion_rate: 0.0
          })
        }
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        setIsLoading(false)
      })

    if (latestWellness) {
      setGameMoodBefore(latestWellness.primary_emotion || "neutral")
    }
  }, [gameId, latestWellness])

  const handleWrapperComplete = async (score: number) => {
    if (!currentGame) return
    try {
      await completeGame(
          currentGame.game_id,
          gameMoodBefore,
          10,
          currentGame.xp_reward,
          score,
          ["Session Complete"]
      )
      setShowFeedbackModal(true)
    } catch (e) {
      console.error("Failed to save progress:", e)
      setShowFeedbackModal(true)
    }
  }

  const handleFeedbackSubmit = async () => {
    if (!currentGame) return
    setIsSubmitting(true)
    try {
      const res = await submitGameFeedback(
          currentGame.game_id,
          gameMoodBefore,
          selectedFeedback,
          starRating
      )
      if (res) {
        toast({
          title: "Feedback Saved",
          description: `AI recommended weights successfully optimized. XP reward added!`,
        })
      }
      setShowFeedbackModal(false)
      router.push("/dashboard/wellness") // Redirect back to wellness dashboard
    } catch (e) {
      console.error(e)
      setShowFeedbackModal(false)
      router.push("/dashboard/wellness")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !currentGame) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Gamepad className="w-10 h-10 text-indigo-500 animate-bounce" />
            <p className="text-slate-400 text-sm font-semibold">Loading exercise assets...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <GameWrapper
          title={currentGame.name}
          gameId={currentGame.game_id}
          xpReward={currentGame.xp_reward}
          onComplete={handleWrapperComplete}
          onExit={() => router.push("/dashboard/wellness")}
        >
          {({ isPaused, score, setScore, addAchievement, triggerComplete, restartTrigger }) => (
            <WellnessGamePlayer
              isPaused={isPaused}
              score={score}
              setScore={setScore}
              addAchievement={addAchievement}
              triggerComplete={triggerComplete}
              restartTrigger={restartTrigger}
              gameId={currentGame.game_id}
              gameName={currentGame.name}
              gameCategory={currentGame.category}
            />
          )}
        </GameWrapper>

        {/* Post-Game Feedback Modal */}
        <AnimatePresence>
          {showFeedbackModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white border border-slate-100 rounded-[28px] max-w-md w-full p-6 shadow-2xl relative z-10 space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">Session Complete! 🎉</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Did this activity improve your mood?
                    </p>
                  </div>
                </div>

                {/* Rating Input */}
                <div className="space-y-2 text-center">
                  <span className="text-xs font-semibold text-slate-500 block">Rate this exercise</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStarRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer text-yellow-400"
                      >
                        <Star className={`w-6 h-6 ${star <= starRating ? "fill-yellow-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood Feedback Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 block text-center">
                    How do you feel now?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "Much Better", label: "😀 Much Better" },
                      { value: "Better", label: "🙂 Better" },
                      { value: "Same", label: "😐 Same" },
                      { value: "Worse", label: "🙁 Worse" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedFeedback(opt.value)}
                        className={`py-3 px-2 rounded-xl text-sm font-medium border text-center transition-all ${
                          selectedFeedback === opt.value
                            ? "bg-indigo-50 border-indigo-500 text-indigo-600 font-bold"
                            : "bg-white border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmitting}
                    className="w-full rounded-full py-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/20 font-bold"
                  >
                    {isSubmitting ? "Logging feedback..." : "Submit to AI Engine"}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
