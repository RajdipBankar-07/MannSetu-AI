"use client"

import { motion } from "framer-motion"
import { Clock, ChevronRight } from "lucide-react"

export interface Activity {
  id: string
  title: string
  description: string
  duration_minutes: number
  category: string
  emoji: string
}

interface ActivityCardProps {
  activity: Activity
  index?: number
  onStart?: (activity: Activity) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  breathing: "from-blue-500/10 to-cyan-500/10 border-blue-200/50 dark:border-blue-800/40",
  grounding: "from-green-500/10 to-emerald-500/10 border-green-200/50 dark:border-green-800/40",
  journaling: "from-purple-500/10 to-violet-500/10 border-purple-200/50 dark:border-purple-800/40",
  gratitude: "from-yellow-500/10 to-amber-500/10 border-yellow-200/50 dark:border-yellow-800/40",
  movement: "from-orange-500/10 to-red-500/10 border-orange-200/50 dark:border-orange-800/40",
  visualisation: "from-pink-500/10 to-rose-500/10 border-pink-200/50 dark:border-pink-800/40",
  mindfulness: "from-indigo-500/10 to-blue-500/10 border-indigo-200/50 dark:border-indigo-800/40",
  connection: "from-teal-500/10 to-cyan-500/10 border-teal-200/50 dark:border-teal-800/40",
  rest: "from-slate-500/10 to-gray-500/10 border-slate-200/50 dark:border-slate-800/40",
  productivity: "from-violet-500/10 to-purple-500/10 border-violet-200/50 dark:border-violet-800/40",
}

const BUTTON_COLORS: Record<string, string> = {
  breathing: "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40",
  grounding: "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40",
  journaling: "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40",
  gratitude: "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40",
  movement: "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40",
  visualisation: "text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40",
  mindfulness: "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40",
  connection: "text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40",
  rest: "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/40",
  productivity: "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40",
}

export function ActivityCard({ activity, index = 0, onStart }: ActivityCardProps) {
  const colorClass = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.mindfulness
  const buttonClass = BUTTON_COLORS[activity.category] || BUTTON_COLORS.mindfulness

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.25 }}
      className={`group relative flex gap-3 p-3 rounded-xl border bg-gradient-to-r ${colorClass} backdrop-blur-sm cursor-pointer hover:shadow-md transition-all duration-200`}
      onClick={() => onStart?.(activity)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onStart?.(activity)}
      aria-label={`Try activity: ${activity.title}`}
    >
      {/* Emoji icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
        {activity.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{activity.title}</p>
          <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
            <Clock className="w-2.5 h-2.5" />
            {activity.duration_minutes}m
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
          {activity.description}
        </p>
      </div>

      {/* Arrow */}
      <div className={`flex-shrink-0 self-center w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${buttonClass}`}>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  )
}

interface ActivitySuggestionsProps {
  activities: Activity[]
  emotion?: string
  onStart?: (activity: Activity) => void
}

export function ActivitySuggestions({ activities, emotion, onStart }: ActivitySuggestionsProps) {
  if (!activities || activities.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="mt-2 space-y-1.5"
    >
      <p className="text-[11px] font-medium text-muted-foreground px-1">
        ✨ Try one of these {emotion && emotion !== "Neutral" ? `for ${emotion.toLowerCase()}` : ""}:
      </p>
      {activities.map((activity, i) => (
        <ActivityCard key={activity.id} activity={activity} index={i} onStart={onStart} />
      ))}
    </motion.div>
  )
}
