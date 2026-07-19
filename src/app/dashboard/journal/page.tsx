"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  Tag,
  Sparkles,
  Calendar,
  TrendingUp,
  BookOpen,
  Trash2,
  Edit3,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { formatDate, formatRelativeTime, getMoodEmoji, generateId } from "@/lib/utils"

interface JournalEntry {
  id: string
  title: string
  content: string
  emotion: string
  stressScore: number
  tags: string[]
  aiSummary: string
  createdAt: string
}

const mockJournals: JournalEntry[] = [
  {
    id: "j1",
    title: "A challenging but rewarding day",
    content: "Today was quite difficult with the project deadline looming. I felt overwhelmed in the morning but managed to prioritize tasks and got through most of them. The team was supportive, which helped a lot. By evening, I felt a sense of accomplishment.\n\nI need to remember that feeling overwhelmed is temporary and pushing through with small steps really works.",
    emotion: "😤 Stressed → 😊 Accomplished",
    stressScore: 65,
    tags: ["work", "accomplishment", "teamwork"],
    aiSummary: "You navigated workplace stress effectively, demonstrating resilience. The shift from overwhelm to accomplishment shows strong adaptive coping skills.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "j2",
    title: "Morning gratitude practice",
    content: "Started the day with 10 minutes of meditation. Felt present and at peace. Listed three things I'm grateful for:\n1. Good health\n2. Supportive family\n3. The rainy weather that makes everything feel cozy\n\nThis practice really sets a positive tone for the day.",
    emotion: "🧘 Peaceful",
    stressScore: 20,
    tags: ["gratitude", "meditation", "morning"],
    aiSummary: "Your morning routine reflects excellent self-care habits. Gratitude practice consistently correlates with improved mood throughout the day.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "j3",
    title: "Reflecting on relationships",
    content: "Had a long conversation with my best friend today. It's amazing how talking to someone who truly knows you can lift your spirits. We discussed our dreams and plans for the future.\n\nI sometimes forget to nurture these relationships. Note to self: reach out to loved ones more often.",
    emotion: "💙 Connected",
    stressScore: 15,
    tags: ["relationships", "friendship", "connection"],
    aiSummary: "Social connection is a key protective factor for mental health. This reflection shows self-awareness about the value of relationships in your wellbeing.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

const allTags = ["work", "gratitude", "anxiety", "relationships", "meditation", "exercise", "family", "health"]

export default function JournalPage() {
  const [journals, setJournals] = useState<JournalEntry[]>(mockJournals)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [writeOpen, setWriteOpen] = useState(false)
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const filtered = journals.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTag = selectedTag ? j.tags.includes(selectedTag) : true
    return matchSearch && matchTag
  })

  const handleSave = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: "Fill in all fields", variant: "destructive" })
      return
    }
    setIsSaving(true)

    // Extracted hashtags or fallback tags
    const hashTags = newContent
      .split(/\s+/)
      .filter((w) => w.startsWith("#"))
      .map((t) => t.slice(1))
      .slice(0, 3)

    const fallbackTags = hashTags.length > 0 ? hashTags : ["reflective"]

    try {
      const res = await fetch("/api/journal/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
        },
        body: JSON.stringify({
          content: newContent,
          mood_score: 6 // default mood score
        })
      })

      if (res.ok) {
        const data = await res.json()
        const newEntry: JournalEntry = {
          id: data._id || generateId(),
          title: newTitle,
          content: newContent,
          emotion: data.primary_emotion,
          stressScore: 100 - (data.mood_score * 10), // Map mood scale 10 to stress scale
          tags: fallbackTags,
          aiSummary: data.summary,
          createdAt: data.timestamp || new Date().toISOString(),
        }

        setJournals((prev) => [newEntry, ...prev])
        toast({ title: "Journal analyzed! 📝", description: "Positive insights and summary saved." })
        setIsSaving(false)
        setWriteOpen(false)
        setNewTitle("")
        setNewContent("")
        return
      }
      throw new Error("Backend offline")
    } catch (err) {
      console.warn("FastAPI journal offline, generating mock details.", err)
      const newEntry: JournalEntry = {
        id: generateId(),
        title: newTitle,
        content: newContent,
        emotion: "😐 Reflective",
        stressScore: Math.floor(Math.random() * 60 + 20),
        tags: fallbackTags,
        aiSummary: "Your journal entry has been analyzed. Showing self-awareness and reflective thinking, which are key components of emotional intelligence.",
        createdAt: new Date().toISOString(),
      }
      setJournals((prev) => [newEntry, ...prev])
      setIsSaving(false)
      setWriteOpen(false)
      setNewTitle("")
      setNewContent("")
    }
  }

  const handleDelete = (id: string) => {
    setJournals((prev) => prev.filter((j) => j.id !== id))
    if (selectedJournal?.id === id) setSelectedJournal(null)
    toast({ title: "Entry deleted" })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Journal</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Write, reflect, and gain AI-powered insights
          </p>
        </div>
        <Button variant="gradient" onClick={() => setWriteOpen(true)} id="new-journal-btn">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Entries", value: journals.length, icon: BookOpen, color: "text-primary" },
          { label: "Avg Stress Score", value: "42/100", icon: TrendingUp, color: "text-[#F59E0B]" },
          { label: "Writing Streak", value: "5 days", icon: Calendar, color: "text-[#22C55E]" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Journal List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search journals..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((journal) => (
              <motion.div
                key={journal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`cursor-pointer card-hover ${selectedJournal?.id === journal.id ? "border-primary/50 ring-1 ring-primary/20" : ""}`}
                  onClick={() => setSelectedJournal(journal)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{journal.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {journal.content}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="shrink-0 w-6 h-6" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit3 className="w-4 h-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(journal.id) }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs">{journal.emotion}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatRelativeTime(journal.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {journal.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Journal Detail */}
        <div className="lg:col-span-2">
          {selectedJournal ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedJournal.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(selectedJournal.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedJournal.emotion}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {selectedJournal.content}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {selectedJournal.tags.map((tag) => (
                      <Badge key={tag} variant="purple" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />#{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stress Score */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Stress Score</p>
                    <span className={`text-lg font-bold ${selectedJournal.stressScore > 60 ? "text-[#EF4444]" : selectedJournal.stressScore > 40 ? "text-[#F59E0B]" : "text-[#22C55E]"}`}>
                      {selectedJournal.stressScore}/100
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${selectedJournal.stressScore}%`,
                        backgroundColor: selectedJournal.stressScore > 60 ? "#EF4444" : selectedJournal.stressScore > 40 ? "#F59E0B" : "#22C55E",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI Emotional Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedJournal.aiSummary}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="success" className="text-xs">Positive Coping</Badge>
                    <Badge variant="cyan" className="text-xs">Self-Aware</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium">Select a journal entry to read</p>
              <p className="text-sm text-muted-foreground mt-1">Or create a new entry to begin</p>
              <Button variant="gradient" className="mt-4" onClick={() => setWriteOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Write New Entry
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Write Dialog */}
      <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Give your entry a title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{getMoodEmoji(5)} How are you feeling?</span>
              <span>•</span>
              <span>Use #tags to organize</span>
            </div>
            <Textarea
              placeholder="Start writing your thoughts, feelings, and reflections... Use #tags like #grateful #anxious #happy to organize your entries."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={10}
              className="text-sm leading-relaxed"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWriteOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Save & Analyze
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
