"use client"

import { useState } from "react"
import { Search, BookOpen, Video, Dumbbell, Filter, ExternalLink, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const resources = [
  {
    id: 1,
    title: "Understanding Cognitive Behavioral Therapy",
    type: "article",
    category: "CBT",
    readTime: "8 min read",
    rating: 4.8,
    desc: "A comprehensive guide to how CBT works and why it's effective for anxiety and depression.",
    tags: ["therapy", "CBT", "anxiety"],
    color: "from-[#4F46E5] to-[#818CF8]",
  },
  {
    id: 2,
    title: "5-Minute Guided Breathing for Stress",
    type: "video",
    category: "Breathing",
    readTime: "5 min",
    rating: 4.9,
    desc: "A quick breathing exercise you can do anywhere to instantly reduce stress.",
    tags: ["breathing", "stress", "quick"],
    color: "from-[#06B6D4] to-[#38BDF8]",
  },
  {
    id: 3,
    title: "Progressive Muscle Relaxation",
    type: "exercise",
    category: "Relaxation",
    readTime: "15 min",
    rating: 4.7,
    desc: "Systematically tense and release muscle groups to achieve deep physical relaxation.",
    tags: ["relaxation", "body", "sleep"],
    color: "from-[#22C55E] to-[#4ADE80]",
  },
  {
    id: 4,
    title: "The Science of Sleep and Mental Health",
    type: "article",
    category: "Sleep",
    readTime: "12 min read",
    rating: 4.6,
    desc: "How sleep quality directly impacts mood, anxiety, and cognitive function.",
    tags: ["sleep", "science", "mood"],
    color: "from-[#8B5CF6] to-[#A78BFA]",
  },
  {
    id: 5,
    title: "Mindful Walking Meditation",
    type: "exercise",
    category: "Mindfulness",
    readTime: "20 min",
    rating: 4.8,
    desc: "Turn a simple walk into a powerful mindfulness practice.",
    tags: ["mindfulness", "walking", "meditation"],
    color: "from-[#F59E0B] to-[#FCD34D]",
  },
  {
    id: 6,
    title: "Managing Workplace Anxiety",
    type: "article",
    category: "Work",
    readTime: "10 min read",
    rating: 4.5,
    desc: "Practical strategies for dealing with work-related stress and anxiety.",
    tags: ["work", "anxiety", "productivity"],
    color: "from-[#EF4444] to-[#F87171]",
  },
  {
    id: 7,
    title: "Journaling for Mental Health",
    type: "video",
    category: "Journaling",
    readTime: "18 min",
    rating: 4.7,
    desc: "Evidence-based journaling techniques that improve emotional processing.",
    tags: ["journal", "emotions", "writing"],
    color: "from-[#EC4899] to-[#F472B6]",
  },
  {
    id: 8,
    title: "Box Breathing Technique",
    type: "exercise",
    category: "Breathing",
    readTime: "5 min",
    rating: 4.9,
    desc: "The Navy SEAL technique for rapid stress reduction in high-pressure situations.",
    tags: ["breathing", "stress", "quick"],
    color: "from-[#06B6D4] to-[#4F46E5]",
  },
]

const typeIcons = {
  article: BookOpen,
  video: Video,
  exercise: Dumbbell,
}


export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.includes(searchQuery.toLowerCase()))
    const matchType = selectedType === "all" || r.type === selectedType
    return matchSearch && matchType
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resource Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Curated mental wellness articles, videos, and exercises
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">All ({resources.length})</TabsTrigger>
          <TabsTrigger value="article">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="w-3.5 h-3.5 mr-1" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="exercise">
            <Dumbbell className="w-3.5 h-3.5 mr-1" />
            Exercises
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((resource) => {
              const Icon = typeIcons[resource.type as keyof typeof typeIcons]
              return (
                <Card key={resource.id} className="card-hover overflow-hidden group cursor-pointer">
                  <div className={`h-2 bg-gradient-to-r ${resource.color}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${resource.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        {resource.rating}
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm leading-tight mb-1.5 line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {resource.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{resource.readTime}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-3 text-primary hover:bg-primary/10 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Resource
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium">No resources found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
