"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Sparkles,
  Shield,
  Heart,
  MessageCircle,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Brain,
  Wind,
  BookOpen,
  Smile,
  ChevronRight,
  Play,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

const features = [
  {
    icon: MessageCircle,
    title: "AI Therapy Chat",
    description: "24/7 empathetic AI companion trained in CBT, DBT, and mindfulness techniques.",
    color: "from-[#4F46E5] to-[#818CF8]",
    bg: "bg-[#4F46E5]/10",
  },
  {
    icon: Smile,
    title: "Mood Tracking",
    description: "Track your emotional patterns with intelligent insights and visual analytics.",
    color: "from-[#F59E0B] to-[#FCD34D]",
    bg: "bg-[#F59E0B]/10",
  },
  {
    icon: BookOpen,
    title: "AI-Powered Journal",
    description: "Smart journaling with AI summaries, emotion analysis, and stress scoring.",
    color: "from-[#22C55E] to-[#4ADE80]",
    bg: "bg-[#22C55E]/10",
  },
  {
    icon: Wind,
    title: "Guided Meditation",
    description: "Personalized breathing exercises and meditation sessions for every mood.",
    color: "from-[#06B6D4] to-[#38BDF8]",
    bg: "bg-[#06B6D4]/10",
  },
  {
    icon: Brain,
    title: "Wellness Plans",
    description: "AI-crafted daily wellness routines tailored to your unique mental health needs.",
    color: "from-[#EF4444] to-[#F87171]",
    bg: "bg-[#EF4444]/10",
  },
  {
    icon: Users,
    title: "Anonymous Community",
    description: "Safe, moderated community to share experiences without revealing your identity.",
    color: "from-[#8B5CF6] to-[#A78BFA]",
    bg: "bg-[#8B5CF6]/10",
  },
]

const stats = [
  { value: "50K+", label: "Active Users", icon: Users },
  { value: "4.9★", label: "User Rating", icon: Star },
  { value: "98%", label: "Privacy Score", icon: Shield },
  { value: "24/7", label: "AI Support", icon: Heart },
]

const testimonials = [
  {
    name: "Ananya Krishnan",
    role: "Software Engineer",
    avatar: "AK",
    content: "MannSetu AI has completely transformed how I manage work stress. The AI chat feels genuinely empathetic and the mood tracking insights are incredibly accurate.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "Medical Student",
    avatar: "RM",
    content: "The anonymous community feature is brilliant. I can share my struggles without fear of judgment. The AI journal summaries help me understand my patterns.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Entrepreneur",
    avatar: "PN",
    content: "As someone who was skeptical about AI therapy, I'm amazed at how helpful MannSetu AI is. The wellness plans are practical and the meditation timer is perfect.",
    rating: 5,
  },
]

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["5 AI chat sessions/month", "Basic mood tracking", "3 meditation guides", "Community access"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    features: ["Unlimited AI chat", "Advanced analytics", "Full meditation library", "AI journal insights", "Priority support", "Wellness plans"],
    cta: "Start Pro Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per organization",
    features: ["Everything in Pro", "Team analytics", "Admin dashboard", "Custom integrations", "Dedicated support", "HIPAA compliant"],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">MannSetu AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
            <Link href="#safety" className="hover:text-foreground transition-colors">Privacy & Safety</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" variant="gradient" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-6 px-4 py-1.5 text-sm font-medium gap-2 rounded-full border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                Your Confidential AI Companion for Mental Wellness
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6"
            >
              Mental wellness that{" "}
              <span className="gradient-text">understands you</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl text-balance mb-10"
            >
              MannSetu AI is your private, empathetic AI companion. Track moods, journal thoughts,
              meditate, and get personalized wellness plans — all completely confidential.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="xl" variant="gradient" asChild className="group">
                <Link href="/signup">
                  Start Your Wellness Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  View Demo
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-[#22C55E]" />
              <span>End-to-end encrypted · No data sold · HIPAA compliant</span>
            </motion.div>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl border shadow-2xl overflow-hidden bg-card">
              <div className="bg-gradient-to-r from-[#4F46E5]/20 to-[#06B6D4]/20 p-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                  </div>
                  <div className="flex-1 h-7 rounded-lg bg-background/50 flex items-center px-3">
                    <span className="text-xs text-muted-foreground">app.mannsetu.ai/dashboard</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="bg-background/80 rounded-xl p-3 text-center backdrop-blur-sm">
                        <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="text-xl font-bold gradient-text">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Today&apos;s Mood</p>
                  <div className="text-3xl mb-1">😊</div>
                  <p className="text-sm font-medium">Good — 7/10</p>
                  <p className="text-xs text-muted-foreground">Better than yesterday</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">AI Chat</p>
                  <div className="space-y-2">
                    <div className="bg-muted rounded-lg rounded-tl-sm p-2 text-xs">
                      How are you feeling today? 💙
                    </div>
                    <div className="bg-primary/10 rounded-lg rounded-tr-sm p-2 text-xs text-right">
                      Much better, thanks!
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Wellness Score</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl font-bold text-[#22C55E]">78</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#22C55E] rounded-full" style={{ width: "78%" }} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">↑ 5 points from last week</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-muted/30 py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: "50,000+", l: "Users Supported" },
            { n: "2M+", l: "AI Conversations" },
            { n: "99.9%", l: "Uptime SLA" },
            { n: "4.9/5", l: "App Store Rating" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-bold gradient-text">{s.n}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 text-primary bg-primary/5 border-primary/20">Features</Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-4xl font-bold mb-4">
              Everything you need for mental wellness
            </motion.h2>
            <motion.p variants={fadeIn} className="text-muted-foreground max-w-2xl mx-auto">
              A complete mental wellness ecosystem powered by cutting-edge AI, designed with privacy and compassion at its core.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeIn}>
                  <Card className="h-full card-hover border-0 shadow-sm hover:shadow-md">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 bg-gradient-to-br ${feature.color} bg-clip-text`} style={{ color: "transparent", background: `linear-gradient(135deg, ${feature.color.includes("4F46E5") ? "#4F46E5" : feature.color.includes("F59E0B") ? "#F59E0B" : feature.color.includes("22C55E") ? "#22C55E" : feature.color.includes("06B6D4") ? "#06B6D4" : feature.color.includes("EF4444") ? "#EF4444" : "#8B5CF6"}, transparent)`, WebkitBackgroundClip: "text" }} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="safety" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20">Privacy & Safety</Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-4xl font-bold mb-6">
              Your privacy is our{" "}
              <span className="gradient-text">highest priority</span>
            </motion.h2>
            <motion.p variants={fadeIn} className="text-muted-foreground mb-8">
              We believe mental health conversations are deeply personal. MannSetu AI is built with privacy-first architecture, ensuring your data never leaves your control.
            </motion.p>
            <motion.div variants={stagger} className="space-y-4">
              {[
                "End-to-end encrypted conversations",
                "Zero data sold to third parties",
                "HIPAA and GDPR compliant",
                "Anonymous mode available",
                "One-click data deletion",
                "Regular third-party security audits",
              ].map((item) => (
                <motion.div key={item} variants={fadeIn} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#22C55E] shrink-0" />
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Privacy Dashboard</p>
                  <p className="text-xs text-muted-foreground">Your data, your control</p>
                </div>
              </div>
              {[
                { label: "Conversation Encryption", status: "Active", color: "#22C55E" },
                { label: "Anonymous Mode", status: "Off", color: "#F59E0B" },
                { label: "Data Sharing", status: "Disabled", color: "#22C55E" },
                { label: "Two-Factor Auth", status: "Enabled", color: "#22C55E" },
                { label: "Biometric Lock", status: "Active", color: "#22C55E" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4 text-primary bg-primary/5 border-primary/20">Testimonials</Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-4xl font-bold mb-4">
              Loved by thousands of users
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeIn}>
                <Card className="h-full card-hover">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-semibold">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 text-primary bg-primary/5 border-primary/20">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you need more</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${plan.highlighted
                  ? "bg-gradient-brand text-white border-transparent shadow-xl shadow-primary/25 scale-105"
                  : "bg-card"
                  }`}
              >
                {plan.badge && (
                  <Badge className="mb-4 bg-white/20 text-white border-white/30">{plan.badge}</Badge>
                )}
                <h3 className={`text-xl font-bold mb-1 ${!plan.highlighted && ""}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-white/80" : "text-[#22C55E]"}`} />
                      <span className={plan.highlighted ? "text-white/90" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.highlighted ? "bg-white text-primary hover:bg-white/90" : ""}`}
                  variant={plan.highlighted ? "outline" : "gradient"}
                  asChild
                >
                  <Link href="/signup">
                    {plan.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-brand p-12 text-white">
            <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl font-bold mb-4">Start your wellness journey today</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Join 50,000+ users who have transformed their mental wellness with MannSetu AI. Free forever, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold" asChild>
                <Link href="/signup">Get Started — It&apos;s Free</Link>
              </Button>
              <Button size="lg" variant="glass" asChild>
                <Link href="/dashboard">Explore Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold gradient-text">MannSetu AI</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2025 MannSetu AI. Made with ❤️ for mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
