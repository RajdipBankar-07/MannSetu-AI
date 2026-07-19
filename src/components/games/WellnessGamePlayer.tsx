"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RefreshCw, Heart, Sparkles, Wand2, Volume2, VolumeX, Eye, Flame, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface PlayerProps {
  isPaused: boolean
  score: number
  setScore: (score: number | ((prev: number) => number)) => void
  addAchievement: (ach: string) => void
  triggerComplete: () => void
  restartTrigger: number
  gameId: string
  gameName: string
  gameCategory: string
}

export default function WellnessGamePlayer({
  isPaused,
  score,
  setScore,
  addAchievement,
  triggerComplete,
  restartTrigger,
  gameId,
  gameName,
  gameCategory
}: PlayerProps) {
  const [gameState, setGameState] = useState<any>({})
  const audioCtxRef = useRef<AudioContext | null>(null)
  const soundOscRef = useRef<OscillatorNode | null>(null)
  const [soundOn, setSoundOn] = useState(false)

  // Determine game template/mode based on category or ID
  const isMemoryOrBrain = gameCategory === "Memory" || gameCategory === "Brain Training" || gameCategory === "Cognitive" || gameId.includes("memory") || gameId.includes("sudoku") || gameId.includes("logic")
  const isFocusOrAttention = gameCategory === "Focus" || gameId.includes("focus") || gameId.includes("reaction") || gameId.includes("target")
  const isCreativityOrZen = gameCategory === "Creativity" || gameId.includes("zen") || gameId.includes("painter") || gameId.includes("coloring")
  const isPetOrPlant = gameCategory === "Positive Thinking" || gameId.includes("pet") || gameId.includes("plant") || gameId.includes("companion")
  
  // Default to Breathing/Relaxation if none matches
  const isRelaxationOrBreathing = !isMemoryOrBrain && !isFocusOrAttention && !isCreativityOrZen && !isPetOrPlant

  // Setup/Reset game on load or restartTrigger
  useEffect(() => {
    setScore(0)
    if (isMemoryOrBrain) {
      // Setup Card matching game
      const emojis = ["🌸", "🍃", "☀️", "🌊", "⛰️", "🕊️", "🔮", "💫"]
      const cardsDeck = [...emojis, ...emojis]
        .map((emoji, idx) => ({ id: idx, emoji, matched: false, flipped: false }))
        .sort(() => Math.random() - 0.5)
      setGameState({ cards: cardsDeck, selectedIds: [], matchedCount: 0 })
    } else if (isFocusOrAttention) {
      // Setup focus dots catching
      setGameState({ dots: [], activeCount: 0 })
    } else if (isCreativityOrZen) {
      // Setup painter state
      setGameState({ color: "#6366F1", lines: [] })
    } else if (isPetOrPlant) {
      // Setup virtual pet care
      setGameState({ hydration: 50, energy: 50, love: 50, level: 1 })
    } else {
      // Setup breathing session
      setGameState({ breathPhase: "Inhale", breathSecs: 4 })
    }
  }, [restartTrigger, gameId])

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      stopRelaxingTone()
    }
  }, [])

  // Web Audio API Synthesizer for Relaxing Sounds
  const startRelaxingTone = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const ctx = audioCtxRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      // Create a nice warm sound: low frequency sine + bandpass filter for ambient drone
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gainNode = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(136.1, ctx.currentTime) // Om frequency (136.1 Hz)
      
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(300, ctx.currentTime)

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime)

      osc.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start()
      soundOscRef.current = osc
      setSoundOn(true)
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e)
    }
  }

  const stopRelaxingTone = () => {
    if (soundOscRef.current) {
      try {
        soundOscRef.current.stop()
      } catch (e) {}
      soundOscRef.current = null
    }
    setSoundOn(false)
  }

  const toggleSound = () => {
    if (soundOn) {
      stopRelaxingTone()
    } else {
      startRelaxingTone()
    }
  }

  // --- GAME 1: MEMORY MATCH ---
  const handleCardClick = (cardId: number) => {
    if (isPaused) return
    const { cards, selectedIds, matchedCount } = gameState
    const card = cards.find((c: any) => c.id === cardId)
    
    if (!card || card.flipped || card.matched || selectedIds.length >= 2) return

    // Flip card
    const updatedCards = cards.map((c: any) => c.id === cardId ? { ...c, flipped: true } : c)
    const nextSelected = [...selectedIds, cardId]

    setGameState((prev: any) => ({ ...prev, cards: updatedCards, selectedIds: nextSelected }))

    if (nextSelected.length === 2) {
      const [firstId, secondId] = nextSelected
      const firstCard = cards.find((c: any) => c.id === firstId)
      const secondCard = cards.find((c: any) => c.id === secondId)

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          const finalCards = updatedCards.map((c: any) => 
            (c.id === firstId || c.id === secondId) ? { ...c, matched: true } : c
          )
          const nextMatched = matchedCount + 1
          setScore((s) => s + 50)
          setGameState((prev: any) => ({ ...prev, cards: finalCards, selectedIds: [], matchedCount: nextMatched }))
          
          if (nextMatched === 8) {
            addAchievement("Memory Guru")
            toast({ title: "Memory Palace Cleared! 🎉", description: "You found all matching pairs." })
            triggerComplete()
          }
        }, 600)
      } else {
        // No match, flip back
        setTimeout(() => {
          const finalCards = updatedCards.map((c: any) => 
            (c.id === firstId || c.id === secondId) ? { ...c, flipped: false } : c
          )
          setGameState((prev: any) => ({ ...prev, cards: finalCards, selectedIds: [] }))
        }, 1000)
      }
    }
  }

  // --- GAME 2: FOCUS FOREST DOTS ---
  useEffect(() => {
    if (!isFocusOrAttention || isPaused) return

    const interval = setInterval(() => {
      // Spawn new focus dot
      const newDot = {
        id: Math.random(),
        x: Math.random() * 80 + 10, // padding
        y: Math.random() * 80 + 10,
        size: Math.random() * 20 + 30, // 30px to 50px
        color: ["bg-[#4F46E5]", "bg-[#06B6D4]", "bg-[#F59E0B]", "bg-[#22C55E]", "bg-[#EF4444]"][Math.floor(Math.random() * 5)]
      }
      setGameState((prev: any) => {
        const nextDots = [...(prev.dots || []), newDot].slice(-8) // Limit to 8 active dots
        return { ...prev, dots: nextDots }
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [isFocusOrAttention, isPaused])

  const handleDotClick = (dotId: number) => {
    if (isPaused) return
    const { dots } = gameState
    const clickedDot = dots.find((d: any) => d.id === dotId)
    if (!clickedDot) return

    setScore((s) => s + 20)
    setGameState((prev: any) => ({
      ...prev,
      dots: prev.dots.filter((d: any) => d.id !== dotId)
    }))

    if (score + 20 >= 300) {
      addAchievement("Laser Focus")
      toast({ title: "Focus Forest Cleared! 🌲", description: "Your reaction focus was superb." })
      triggerComplete()
    }
  }

  // --- GAME 3: BREATHING / RELAXATION ---
  useEffect(() => {
    if (!isRelaxationOrBreathing || isPaused) return

    let phaseTimer = 4
    let currentPhaseIdx = 0
    const phases = ["Inhale", "Hold", "Exhale", "Hold"]
    const durations = [4, 4, 4, 4]

    const interval = setInterval(() => {
      phaseTimer--
      if (phaseTimer <= 0) {
        currentPhaseIdx = (currentPhaseIdx + 1) % 4
        phaseTimer = durations[currentPhaseIdx]
        
        const phase = phases[currentPhaseIdx]
        setGameState({ breathPhase: phase, breathSecs: phaseTimer })
        setScore((s) => s + 25)

        // Grant small score
        if (score + 25 >= 200) {
          addAchievement("Zen Master")
          toast({ title: "Breathing Session Restored! 🧘", description: "You finished a complete cycle." })
          triggerComplete()
        }
      } else {
        setGameState((prev: any) => ({ ...prev, breathSecs: phaseTimer }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRelaxationOrBreathing, isPaused, score])

  // --- GAME 4: ZEN CANVAS PAINTER ---
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCreativityOrZen || isPaused) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newLine = { x, y, color: gameState.color }
    setGameState((prev: any) => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }))
    setScore((s) => s + 10)

    if (score + 10 >= 200) {
      addAchievement("Zen Artist")
      toast({ title: "Canvas Saved! 🎨", description: "Your creative expression is beautiful." })
      triggerComplete()
    }
  }

  // --- GAME 5: VIRTUAL PET / PLANT Companion ---
  const performCareAction = (actionType: "water" | "feed" | "play") => {
    if (isPaused) return
    let { hydration, energy, love, level } = gameState
    
    if (actionType === "water") hydration = Math.min(hydration + 20, 100)
    if (actionType === "feed") energy = Math.min(energy + 20, 100)
    if (actionType === "play") love = Math.min(love + 20, 100)

    setScore((s) => s + 30)

    // Calculate level progression
    const totalCare = hydration + energy + love
    const nextLevel = Math.floor(totalCare / 150) + 1

    setGameState({ hydration, energy, love, level: nextLevel })

    if (nextLevel > level) {
      toast({ title: "Companion Level Up! 🌱", description: "Your companion has grown happier." })
    }

    if (score + 30 >= 300) {
      addAchievement("Nurturer Badge")
      triggerComplete()
    }
  }

  // State flag for completion submit modal
  const isSubmitting = false

  return (
    <div className="w-full flex flex-col items-center bg-slate-950/80 backdrop-blur-md border border-slate-900 rounded-[28px] p-6 text-white min-h-[480px] justify-between relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />

      {/* Floating game top details */}
      <div className="w-full flex items-center justify-between z-10 border-b border-white/5 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{gameCategory}</span>
          <h2 className="text-lg font-bold flex items-center gap-1.5 mt-0.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            {gameName}
          </h2>
        </div>
        <div className="flex gap-2">
          {/* Sounds Synthesizer Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            className="w-9 h-9 rounded-xl bg-slate-900 border-white/10 text-slate-300 hover:text-white"
            aria-label="Sound synthesizer"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-xl text-sm font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Score: {score}
          </span>
        </div>
      </div>

      {/* --- PLAY AREA CORE --- */}
      <div className="w-full flex-1 flex items-center justify-center my-6 z-10 min-h-[300px]">
        {isPaused ? (
          <div className="flex flex-col items-center space-y-4 text-slate-400">
            <Pause className="w-12 h-12 text-indigo-500 animate-pulse" />
            <p className="text-sm font-semibold">Game is paused. Click Resume to play.</p>
          </div>
        ) : (
          <>
            {/* Template 1: Card Memory Match */}
            {isMemoryOrBrain && gameState.cards && (
              <div className="grid grid-cols-4 gap-3 max-w-sm w-full mx-auto">
                {gameState.cards.map((card: any) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-2xl border transition-all duration-300 shadow-md transform cursor-pointer ${
                      card.flipped || card.matched
                        ? "bg-indigo-500/10 border-indigo-500 text-white rotate-0"
                        : "bg-slate-900 border-white/10 hover:border-slate-500 -rotate-3"
                    }`}
                  >
                    <span className="transition-all duration-300">
                      {card.flipped || card.matched ? card.emoji : "❓"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Template 2: Focus Dots */}
            {isFocusOrAttention && gameState.dots && (
              <div className="relative w-full h-72 border border-white/5 rounded-2xl bg-slate-950 overflow-hidden">
                {gameState.dots.map((dot: any) => (
                  <button
                    key={dot.id}
                    onClick={() => handleDotClick(dot.id)}
                    style={{ left: `${dot.x}%`, top: `${dot.y}%`, width: `${dot.size}px`, height: `${dot.size}px` }}
                    className={`absolute rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 scale-100 active:scale-95 ${dot.color} animate-pulse border-2 border-white/10 cursor-pointer`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white/80" />
                  </button>
                ))}
                {gameState.dots.length === 0 && (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                    Get ready to tap active elements!
                  </div>
                )}
              </div>
            )}

            {/* Template 3: Relaxation/Breathing Ring */}
            {isRelaxationOrBreathing && (
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
                  
                  <motion.div
                    animate={{
                      scale: gameState.breathPhase === "Inhale" ? 1.3 : gameState.breathPhase === "Hold" ? 1.3 : 1
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600/40 to-cyan-500/40 border border-indigo-500/30 flex flex-col items-center justify-center shadow-2xl"
                  >
                    <span className="text-base font-bold tracking-wide text-white">{gameState.breathPhase}</span>
                    <span className="text-3xl font-extrabold font-mono mt-1 text-cyan-300">{gameState.breathSecs}s</span>
                  </motion.div>
                </div>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Synchronize your breathing with the ring expansion to restore heart rate variability.
                </p>
              </div>
            )}

            {/* Template 4: Zen Mandala Canvas Painter */}
            {isCreativityOrZen && gameState.lines && (
              <div className="flex flex-col items-center space-y-4 w-full">
                <div
                  onClick={handleCanvasClick}
                  className="relative w-full h-64 border border-white/10 rounded-2xl bg-slate-900 overflow-hidden cursor-crosshair"
                >
                  {gameState.lines.map((line: any, idx: number) => (
                    <div
                      key={idx}
                      style={{ left: `${line.x}px`, top: `${line.y}px` }}
                      className="absolute w-4.5 h-4.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm animate-pulse"
                    >
                      {/* Mandala Mirror effects */}
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                    </div>
                  ))}
                  {gameState.lines.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                      Click inside the canvas to build a calm mandala.
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {["#6366F1", "#06B6D4", "#EC4899", "#EAB308", "#10B981"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setGameState((prev: any) => ({ ...prev, color: c }))}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-xl transition-transform border-2 cursor-pointer ${
                        gameState.color === c ? "border-white scale-110" : "border-transparent"
                      }`}
                    />
                  ))}
                  <button
                    onClick={() => setGameState((prev: any) => ({ ...prev, lines: [] }))}
                    className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Clear canvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Template 5: Virtual Companion */}
            {isPetOrPlant && (
              <div className="flex flex-col items-center space-y-5 w-full max-w-sm">
                <div className="flex flex-col items-center space-y-2">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="text-6xl select-none"
                  >
                    {gameId.includes("plant") ? "🌱" : "🐱"}
                  </motion.div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Companion Level: {gameState.level || 1}
                  </span>
                </div>

                {/* Progress Sliders */}
                <div className="w-full space-y-2.5 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                  {[
                    { label: "Hydration", val: gameState.hydration, color: "bg-cyan-500" },
                    { label: "Energy", val: gameState.energy, color: "bg-amber-500" },
                    { label: "Affection", val: gameState.love, color: "bg-rose-500" }
                  ].map((bar) => (
                    <div key={bar.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                        <span>{bar.label}</span>
                        <span>{bar.val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${bar.val}%` }} className={`h-full ${bar.color} transition-all duration-300`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => performCareAction("water")}
                    className="rounded-full bg-slate-900 border-white/10 hover:bg-slate-800 text-xs px-4"
                  >
                    💦 Water
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => performCareAction("feed")}
                    className="rounded-full bg-slate-900 border-white/10 hover:bg-slate-800 text-xs px-4"
                  >
                    🍗 Feed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => performCareAction("play")}
                    className="rounded-full bg-slate-900 border-white/10 hover:bg-slate-800 text-xs px-4"
                  >
                    🧶 Play
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Instructions bar */}
      <div className="w-full text-center border-t border-white/5 pt-4 flex justify-between items-center z-10 text-[11px] text-slate-400">
        <span>Goal: Reach 200+ points to complete session</span>
        <Button
          size="sm"
          variant="gradient"
          onClick={triggerComplete}
          className="rounded-full h-8 text-[11px] px-4 font-bold"
        >
          <Wand2 className="w-3 h-3 mr-1" />
          Complete Early
        </Button>
      </div>
    </div>
  )
}
