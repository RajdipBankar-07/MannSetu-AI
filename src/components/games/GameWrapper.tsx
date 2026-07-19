"use client"

import { useState, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RefreshCw, X, Award, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface GameWrapperProps {
  title: string
  gameId: string
  xpReward: number
  onComplete: (score: number) => void
  onExit: () => void
  children: (props: any) => any
}

export default function GameWrapper({
  title,
  gameId,
  xpReward,
  onComplete,
  onExit,
  children
}: GameWrapperProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [achievements, setAchievements] = useState<string[]>([])
  const [restartTrigger, setRestartTrigger] = useState(0)

  const addAchievement = (ach: string) => {
    if (!achievements.includes(ach)) {
      setAchievements((prev) => [...prev, ach])
    }
  }

  const triggerComplete = () => {
    onComplete(score)
  }

  const handleRestart = () => {
    setScore(0)
    setAchievements([])
    setIsPaused(false)
    setRestartTrigger((prev) => prev + 1)
  }

  return (
    <Card className="w-full border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5 text-slate-500" />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
            <span className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">
              {xpReward} XP Reward
            </span>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Current Score</span>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {score}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPaused((p) => !p)}
              className="rounded-full border-slate-200 dark:border-slate-700"
            >
              {isPaused ? (
                <Play className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              ) : (
                <Pause className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRestart}
              className="rounded-full border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <CardContent className="p-6 relative min-h-[450px] flex items-center justify-center bg-slate-50/20 dark:bg-slate-950/20">
        {/* Game Rendered Here */}
        <div className="w-full h-full flex items-center justify-center">
          {children({
            isPaused,
            score,
            setScore,
            addAchievement,
            triggerComplete,
            restartTrigger
          })}
        </div>

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                className="p-6 max-w-sm"
              >
                <h3 className="text-2xl font-bold text-white mb-2">Game Paused</h3>
                <p className="text-slate-300 text-sm mb-6">
                  Take a deep breath and resume when you are ready.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="default"
                    className="rounded-full px-6 bg-indigo-500 hover:bg-indigo-600 text-white"
                    onClick={() => setIsPaused(false)}
                  >
                    Resume Game
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full px-6 text-white border-slate-700 hover:bg-slate-800"
                    onClick={handleRestart}
                  >
                    Restart
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Footer / Achievements HUD */}
      {achievements.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider shrink-0">
            <Award className="w-3.5 h-3.5 text-yellow-500" /> Unlocked:
          </span>
          <div className="flex gap-2">
            {achievements.map((ach, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30 animate-pulse"
              >
                <Sparkles className="w-3 h-3" />
                {ach}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
