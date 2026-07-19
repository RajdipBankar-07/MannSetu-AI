"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface QuickMessage {
  role: "user" | "ai"
  text: string
}

const quickReplies = ["I'm feeling anxious", "Help me breathe", "I need support", "Positive affirmation"]

const aiQuickResponses: Record<string, string> = {
  "I'm feeling anxious": "Take a deep breath. You're safe. Let's do a quick grounding exercise — name 5 things you can see right now.",
  "Help me breathe": "Let's do box breathing together. Inhale for 4 counts... Hold for 4... Exhale for 4... Hold for 4. Repeat.",
  "I need support": "I'm here with you. You're not alone. Whatever you're going through, we'll face it together. 💙",
  "Positive affirmation": "You are worthy of love and belonging. You are stronger than you know. Today is a new opportunity. 🌟",
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<QuickMessage[]>([
    { role: "ai", text: "Hi! I'm your wellness companion. How can I support you right now? 💙" },
  ])
  const [input, setInput] = useState("")

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input.trim()
    if (!messageText) return

    setMessages((prev) => [...prev, { role: "user", text: messageText }])
    setInput("")

    await new Promise((r) => setTimeout(r, 800))
    const response =
      aiQuickResponses[messageText] ??
      "I hear you. Remember, every feeling is valid and temporary. You're doing great by reaching out. 💙"
    setMessages((prev) => [...prev, { role: "ai", text: response }])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-4 w-80 rounded-2xl border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-brand text-white">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">AI Companion</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                  <span className="text-xs text-white/80">Always here for you</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white hover:bg-white/20 w-7 h-7"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-white hover:bg-white/20 w-7 h-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="text-[10px] px-2 py-1 rounded-full border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 p-3 border-t">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="h-8 text-xs"
              />
              <Button
                size="icon-sm"
                variant="gradient"
                onClick={() => sendMessage()}
                className="w-8 h-8 rounded-xl"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className="w-14 h-14 rounded-full bg-gradient-brand shadow-lg shadow-primary/30 flex items-center justify-center text-white relative"
        aria-label="Open AI assistant"
      >
        <Sparkles className="w-6 h-6" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center animate-bounce">
            1
          </span>
        )}
      </motion.button>
    </div>
  )
}
