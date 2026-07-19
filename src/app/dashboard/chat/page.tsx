"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Mic,
  Paperclip,
  ImageIcon,
  Search,
  Plus,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Trash2,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChatStore } from "@/store/chat"
import { useAuthStore } from "@/store/auth"
import { toast } from "@/hooks/use-toast"
import { formatRelativeTime, getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"

const suggestedPrompts = [
  "I'm feeling anxious about work today",
  "Help me with a quick breathing exercise",
  "I need to vent about something",
  "What are some mindfulness tips?",
  "I'm having trouble sleeping",
  "Help me set wellness goals",
]

const AI_RESPONSES = [
  "I hear you, and I want you to know that's completely valid. Let's explore this together. Can you tell me more about what specifically is making you feel this way? 💙",
  "Thank you for sharing that with me. It takes courage to open up. What has been the most challenging part for you recently?",
  "That sounds really difficult. I'm here for you. Let's try a quick grounding exercise together — can you name 5 things you can see around you right now?",
  "I understand how overwhelming that can feel. Let's break this down into smaller, manageable steps. What feels most urgent to address first?",
  "Your feelings are completely valid. Remember, it's okay to not be okay sometimes. Would you like to explore some coping strategies that might help?",
]

export default function ChatPage() {
  const { conversations, activeConversationId, setActiveConversation, addMessage, createConversation, setTyping, isTyping, deleteConversation } = useChatStore()
  const { user } = useAuthStore()
  const [input, setInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Multimodal states
  const [uploadedImage, setUploadedImage] = useState<{ mime_type: string; data: string; filename: string } | null>(null)
  const [uploadedPdf, setUploadedPdf] = useState<{ filename: string; data: string } | null>(null)
  const [isListening, setIsListening] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const activeConversation = conversations.find((c) => c.id === activeConversationId)
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeConversation?.messages, isTyping])

  const triggerImageUpload = () => imageInputRef.current?.click()
  const triggerPdfUpload = () => pdfInputRef.current?.click()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]
      setUploadedImage({
        mime_type: file.type,
        data: base64,
        filename: file.name
      })
      toast({ title: "Image attached 🖼️", description: file.name })
    }
    reader.readAsDataURL(file)
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file type", description: "Please select a PDF file.", variant: "destructive" })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]
      setUploadedPdf({
        filename: file.name,
        data: base64
      })
      toast({ title: "PDF attached 📄", description: file.name })
    }
    reader.readAsDataURL(file)
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast({
        title: "Not supported",
        description: "Your browser does not support Speech Recognition.",
        variant: "destructive",
      })
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      toast({ title: "Listening... 🎙️", description: "Start speaking now." })
    }

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => (prev ? prev + " " + transcript : transcript))
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const sendMessage = async () => {
    if (!input.trim() && !uploadedImage && !uploadedPdf) return

    const convId = activeConversationId ?? createConversation()
    const messageText = input.trim()
    
    // Add custom context label to the content if attachments are present
    let contentLabel = messageText
    if (uploadedImage && !messageText) {
      contentLabel = "[Sent an image]"
    } else if (uploadedPdf && !messageText) {
      contentLabel = `[Sent PDF: ${uploadedPdf.filename}]`
    }
    
    setInput("")

    // 1. Add user message
    addMessage(convId, {
      role: "user",
      content: contentLabel,
      timestamp: new Date(),
    })

    setTyping(true)

    // Retrieve active conversation messages to send as context
    const currentConv = useChatStore.getState().conversations.find((c) => c.id === convId)
    const chatHistory = currentConv?.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })) || []

    const imgPayload = uploadedImage
    const pdfPayload = uploadedPdf
    setUploadedImage(null)
    setUploadedPdf(null)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
        },
        body: JSON.stringify({
          messages: chatHistory,
          image: imgPayload,
          pdf: pdfPayload
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTyping(false)
        addMessage(convId, {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          emotion: "🔮 AI Coach",
        })
        return
      }
      throw new Error("API failed")
    } catch (err) {
      console.warn("FastAPI chat offline, using mock responses.", err)
      setTyping(false)
      const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
      addMessage(convId, {
        role: "assistant",
        content: response,
        timestamp: new Date(),
        emotion: "🤗 Empathetic",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard" })
  }

  return (
    <div className="flex h-[calc(100vh-64px)] -m-4 lg:-m-6 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold flex-1">AI Chat</h2>
            <Button size="icon-sm" variant="gradient" onClick={createConversation} aria-label="New chat">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors",
                  conv.id === activeConversationId
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(conv.updatedAt)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-card">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">MannSetu AI</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs text-muted-foreground">Online · Confidential</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Badge variant="success" className="text-xs">Encrypted</Badge>
            <Button variant="ghost" size="icon-sm">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">How are you feeling today?</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                I&apos;m your confidential AI companion. Share anything — I&apos;m here to listen and support you.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-left p-3 rounded-xl border hover:bg-muted hover:border-primary/30 transition-all duration-200 text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {activeConversation.messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <Avatar className="w-8 h-8 shrink-0 mt-1">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-xs">{getInitials(user?.name ?? "U")}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("flex flex-col gap-1 max-w-[80%]", message.role === "user" && "items-end")}>
                    {message.emotion && message.role === "assistant" && (
                      <Badge variant="cyan" className="text-xs self-start">{message.emotion}</Badge>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-1 mt-1">
                        <Button variant="ghost" size="icon-sm" className="w-6 h-6 rounded-lg" onClick={() => handleCopy(message.content)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="w-6 h-6 rounded-lg">
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="w-6 h-6 rounded-lg">
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground ml-1">
                          {formatRelativeTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-muted-foreground/50 typing-dot"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Hidden inputs for uploads */}
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <input
          type="file"
          ref={pdfInputRef}
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfChange}
        />

        {/* Input */}
        <div className="p-4 border-t bg-card">
          <div className="max-w-3xl mx-auto">
            {/* Attachment Previews */}
            {(uploadedImage || uploadedPdf) && (
              <div className="flex gap-2 mb-2 p-2 bg-muted/50 rounded-xl max-w-fit animate-in fade-in slide-in-from-bottom-2">
                {uploadedImage && (
                  <div className="relative group border rounded-lg overflow-hidden bg-background">
                    <img
                      src={`data:${uploadedImage.mime_type};base64,${uploadedImage.data}`}
                      alt="Upload preview"
                      className="h-14 w-14 object-cover"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                      aria-label="Remove image"
                    >
                      <Plus className="w-3.5 h-3.5 rotate-45 text-white" />
                    </button>
                  </div>
                )}
                {uploadedPdf && (
                  <div className="relative flex items-center gap-2 p-2 pr-8 border rounded-lg bg-background text-xs max-w-xs">
                    <Paperclip className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate max-w-[120px] font-medium">{uploadedPdf.filename}</span>
                    <button
                      onClick={() => setUploadedPdf(null)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                      aria-label="Remove PDF"
                    >
                      <Plus className="w-3 h-3 rotate-45 text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-end gap-2 p-2 rounded-2xl border bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn("text-muted-foreground", uploadedPdf && "text-primary")}
                  aria-label="Attach PDF"
                  onClick={triggerPdfUpload}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn("text-muted-foreground", uploadedImage && "text-primary")}
                  aria-label="Attach image"
                  onClick={triggerImageUpload}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share how you're feeling..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none flex-1"
              />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn("text-muted-foreground", isListening && "text-destructive animate-pulse")}
                  aria-label="Voice input"
                  onClick={toggleListening}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="gradient"
                  onClick={sendMessage}
                  disabled={(!input.trim() && !uploadedImage && !uploadedPdf) || isTyping}
                  aria-label="Send message"
                  className="rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              All conversations are end-to-end encrypted and completely confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
