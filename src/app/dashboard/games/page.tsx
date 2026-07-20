"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Gamepad, Star, Clock, Brain, Flame, Award, Zap, Compass } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getGames, Game } from "@/lib/api/games"
import { useAuthStore } from "@/store/auth"

const categories = [
  { label: "All Games", value: "all" },
  { label: "Relaxation", value: "Relaxation" },
  { label: "Mindfulness", value: "Mindfulness" },
  { label: "Cognitive", value: "Cognitive" },
  { label: "Memory", value: "Memory" },
  { label: "Focus", value: "Focus" },
  { label: "Creativity", value: "Creativity" }
]

export default function GamesDashboardPage() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    setIsLoading(true)
    getGames()
      .then((data) => {
        setGames(data)
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredGames = selectedCategory === "all"
    ? games
    : games.filter((g) => g.category === selectedCategory)

  // Calculate user XP stats
  const userXP = user?.xp ?? 150
  const userLevel = user?.level ?? 1
  const levelMinXp = (userLevel - 1) * 500
  const levelMaxXp = userLevel * 500
  const xpProgress = ((userXP - levelMinXp) / 500) * 100

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gamepad className="w-6 h-6 text-indigo-500" />
              Wellness Games
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Engage in interactive cognitive tasks to calm stress and elevate your mental scores
            </p>
          </div>
          
          {/* Level Badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-extrabold text-lg shrink-0">
              {userLevel}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Level {userLevel}</span>
                <span className="text-indigo-400">{userXP % 500}/500 XP</span>
              </div>
              <Progress value={xpProgress} className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className="rounded-full text-xs font-semibold px-4"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
            <Gamepad className="w-10 h-10 text-indigo-500 animate-bounce" />
            <p className="text-slate-400 text-sm font-medium">Syncing wellness games...</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredGames.map((game) => (
              <motion.div variants={itemAnim} key={game.game_id}>
                <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 card-hover flex flex-col h-full bg-card">
                  {/* Game cover */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={game.cover_url}
                      alt={game.name}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Badge className="bg-slate-950/80 backdrop-blur-md text-white border-0 text-[10px] font-bold">
                        {game.difficulty}
                      </Badge>
                      <Badge className="bg-indigo-500/90 text-white border-0 text-[10px] font-bold flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" />
                        +{game.xp_reward} XP
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                        {game.category}
                      </span>
                      <h3 className="font-bold text-lg text-slate-950 dark:text-white leading-tight">
                        {game.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {game.mood_benefit}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {game.duration}
                      </span>
                      <Button asChild size="sm" className="rounded-full px-4 text-xs font-bold bg-gradient-brand hover:scale-105 active:scale-95 transition-transform text-white">
                        <Link href={`/games/${game.game_id.replace(/_/g, "-")}`}>
                          Play Game
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}
