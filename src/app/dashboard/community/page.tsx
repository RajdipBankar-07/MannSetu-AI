"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageSquare, TrendingUp, Plus, Shield, Search } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatRelativeTime } from "@/lib/utils"

interface Post {
  id: string
  content: string
  category: string
  likes: number
  comments: number
  isLiked: boolean
  isAIModerated: boolean
  createdAt: string
  userAlias: string
  avatarColor: string
}

const initialPosts: Post[] = [
  {
    id: "p1",
    content: "I've been practicing gratitude journaling for 30 days now and the difference is incredible. I used to wake up dreading the day, but now I actually look forward to mornings. If you're struggling, please try it — even just 3 things you're grateful for.",
    category: "Inspiration",
    likes: 124,
    comments: 18,
    isLiked: false,
    isAIModerated: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    userAlias: "MindfulWanderer",
    avatarColor: "from-[#4F46E5] to-[#06B6D4]",
  },
  {
    id: "p2",
    content: "Does anyone else feel exhausted even after sleeping 8 hours? I've been dealing with this for months. My doctor says everything is fine but I just don't feel rested. Could it be anxiety?",
    category: "Question",
    likes: 67,
    comments: 42,
    isLiked: true,
    isAIModerated: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    userAlias: "TiredSoul_22",
    avatarColor: "from-[#F59E0B] to-[#EF4444]",
  },
  {
    id: "p3",
    content: "Therapy milestone: I just had my 50th session! When I started, I couldn't even say 'I'm struggling' without crying. Today I talked openly about my childhood trauma. Progress is real, even when it feels invisible.",
    category: "Milestone",
    likes: 289,
    comments: 56,
    isLiked: false,
    isAIModerated: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    userAlias: "HealingHeart_K",
    avatarColor: "from-[#22C55E] to-[#06B6D4]",
  },
  {
    id: "p4",
    content: "Reminder: You don't have to earn rest. You don't have to be productive every minute of every day. Sometimes existing is enough. Be gentle with yourself today. 💙",
    category: "Support",
    likes: 445,
    comments: 23,
    isLiked: true,
    isAIModerated: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    userAlias: "KindnessFirst",
    avatarColor: "from-[#8B5CF6] to-[#EC4899]",
  },
]

const categories = ["All", "Support", "Question", "Inspiration", "Milestone", "Vent"]

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [postOpen, setPostOpen] = useState(false)
  const [newPost, setNewPost] = useState("")
  const [newCategory, setNewCategory] = useState("Support")

  const filtered = posts.filter((p) => {
    const matchCat = selectedCategory === "All" || p.category === selectedCategory
    const matchSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    )
  }

  const handlePost = () => {
    if (!newPost.trim()) {
      toast({ title: "Please write something", variant: "destructive" })
      return
    }
    const aliases = ["SilentStrength", "MindfulMaven", "HopeBuilder", "PeaceSeekerX", "WellnessWarrior"]
    const colors = ["from-[#4F46E5] to-[#06B6D4]", "from-[#22C55E] to-[#10B981]", "from-[#F59E0B] to-[#EF4444]"]
    const newEntry: Post = {
      id: `p_${Date.now()}`,
      content: newPost,
      category: newCategory,
      likes: 0,
      comments: 0,
      isLiked: false,
      isAIModerated: true,
      createdAt: new Date().toISOString(),
      userAlias: aliases[Math.floor(Math.random() * aliases.length)],
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    }
    setPosts((prev) => [newEntry, ...prev])
    setPostOpen(false)
    setNewPost("")
    toast({ title: "Posted anonymously! 🎉", description: "AI moderation approved your post." })
  }

  const categoryColors: Record<string, string> = {
    Inspiration: "purple",
    Question: "cyan",
    Milestone: "success",
    Support: "warning",
    Vent: "danger",
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Anonymous, safe, and AI-moderated discussions
          </p>
        </div>
        <Button variant="gradient" onClick={() => setPostOpen(true)} id="new-post-btn">
          <Plus className="w-4 h-4" />
          Share Anonymously
        </Button>
      </div>

      {/* Safe Space Banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
        <Shield className="w-5 h-5 text-[#22C55E] shrink-0" />
        <p className="text-sm text-[#22C55E]">
          This is a safe, anonymous space. All posts are AI-moderated for safety and compassion.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Community Members", value: "12,847", icon: TrendingUp, color: "text-primary" },
          { label: "Posts Today", value: "342", icon: MessageSquare, color: "text-[#22C55E]" },
          { label: "Helpful Reactions", value: "8.4K", icon: Heart, color: "text-[#EF4444]" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-3 text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback
                        className={`text-xs text-white bg-gradient-to-br ${post.avatarColor}`}
                      >
                        {post.userAlias.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{post.userAlias}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.isAIModerated && (
                      <Badge variant="success" className="text-xs gap-1">
                        <Shield className="w-3 h-3" />
                        AI Safe
                      </Badge>
                    )}
                    <Badge
                      variant={(categoryColors[post.category] as "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "danger" | "cyan" | "purple") ?? "outline"}
                      className="text-xs"
                    >
                      {post.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${post.isLiked ? "text-[#EF4444]" : "text-muted-foreground hover:text-[#EF4444]"}`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    {post.comments}
                  </button>
                  <span className="ml-auto text-xs text-muted-foreground">💙 {Math.floor(post.likes * 0.8)} found this helpful</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* New Post Dialog */}
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Anonymously</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#22C55E]/10 text-[#22C55E] text-xs">
              <Shield className="w-4 h-4 shrink-0" />
              Your identity is completely protected. AI will review before posting.
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(1).map((cat) => (
                <Badge
                  key={cat}
                  variant={newCategory === cat ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setNewCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="Share your thoughts, ask for support, or inspire others..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {newPost.length}/500 characters
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handlePost}>
              <Shield className="w-4 h-4 mr-1" />
              Post Anonymously
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
