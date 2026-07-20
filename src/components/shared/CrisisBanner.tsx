"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, X, AlertTriangle, Heart } from "lucide-react"

interface CrisisBannerProps {
  show: boolean
  onDismiss?: () => void
}

const CRISIS_LINES = [
  { name: "Tele-MANAS", number: "14416", tag: "Free · 24/7 · Govt. of India", color: "from-red-500 to-orange-500" },
  { name: "iCall (TISS)", number: "9152987821", tag: "Mon–Sat, 8am–10pm", color: "from-orange-500 to-amber-500" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", tag: "24/7", color: "from-amber-500 to-yellow-500" },
]

export function CrisisBanner({ show, onDismiss }: CrisisBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20, scaleY: 0.9 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative mx-4 mb-3 rounded-2xl overflow-hidden shadow-lg border border-red-200/50 dark:border-red-900/50"
          role="alert"
          aria-live="assertive"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/60 dark:via-orange-950/50 dark:to-amber-950/40" />
          
          {/* Animated pulse border */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-red-400/30 dark:border-red-500/20"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="relative p-4">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <motion.div
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-white fill-white" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">
                    You're not alone — help is here
                  </p>
                </div>
                <p className="text-xs text-red-600/80 dark:text-red-400/70 leading-relaxed">
                  If you or someone you know is in crisis, please reach out to one of these free, confidential helplines:
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                aria-label="Dismiss crisis banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Crisis Lines */}
            <div className="flex flex-col sm:flex-row gap-2">
              {CRISIS_LINES.map((line) => (
                <a
                  key={line.number}
                  href={`tel:${line.number.replace(/-/g, "")}`}
                  className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-red-100 dark:border-red-900/40 hover:bg-white dark:hover:bg-black/30 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 flex-1"
                  aria-label={`Call ${line.name} at ${line.number}`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${line.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <Phone className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{line.name}</p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-none">{line.number}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{line.tag}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer note */}
            <p className="text-[10px] text-center text-red-500/70 dark:text-red-400/60 mt-2.5 leading-relaxed">
              💙 Reaching out is brave. These services are free, confidential, and available in Hindi &amp; English.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
