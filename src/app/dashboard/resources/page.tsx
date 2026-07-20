"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, ChevronDown, Heart, Phone, ExternalLink, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ─── Types ────────────────────────────────────────────────────────────────────

type Language = "en" | "hi"

interface Article {
  id: string
  category: string
  emoji: string
  title: { en: string; hi: string }
  summary: { en: string; hi: string }
  body: { en: string; hi: string }
  tags: string[]
}

// ─── Content ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: { en: "All Topics", hi: "सभी विषय" }, emoji: "📚" },
  { id: "myths", label: { en: "Breaking Myths", hi: "मिथक तोड़ें" }, emoji: "💡" },
  { id: "family", label: { en: "Family Conversations", hi: "परिवार से बात" }, emoji: "🏠" },
  { id: "academic", label: { en: "Academic Pressure", hi: "पढ़ाई का दबाव" }, emoji: "📖" },
  { id: "seeking-help", label: { en: "Seeking Help", hi: "मदद माँगना" }, emoji: "🤝" },
  { id: "self-care", label: { en: "Self-Care", hi: "खुद की देखभाल" }, emoji: "🌱" },
]

const ARTICLES: Article[] = [
  {
    id: "therapy-myth",
    category: "myths",
    emoji: "🧠",
    title: {
      en: "Therapy isn't just for 'pagal' people",
      hi: "'पागल' लोगों के लिए नहीं है थेरेपी",
    },
    summary: {
      en: "One of the most harmful myths in India is that therapy is only for people with serious mental illness. The truth is very different.",
      hi: "भारत में सबसे हानिकारक मिथकों में से एक यह है कि थेरेपी केवल गंभीर मानसिक बीमारी वाले लोगों के लिए है।",
    },
    body: {
      en: `Therapy is a professional conversation with a trained person who helps you understand your thoughts, emotions, and patterns — the same way a gym trainer helps you with your body.\n\nYou don't need to be "broken" to go to therapy. People go to therapy for:\n• Exam stress and career confusion\n• Relationship problems and family conflicts\n• Feeling lost, empty, or stuck\n• Building better habits and self-confidence\n\nIn countries like the UK and US, therapy is normalised — people talk about their therapist like they talk about their doctor. India is getting there, and you can be part of that change.\n\n**The bottom line:** Going to therapy is a sign of self-awareness and courage — not weakness.`,
      hi: `थेरेपी एक प्रशिक्षित व्यक्ति के साथ एक पेशेवर बातचीत है जो आपको अपने विचारों, भावनाओं और पैटर्न को समझने में मदद करता है।\n\nथेरेपी के लिए जाने के कारण:\n• परीक्षा का तनाव और करियर की उलझन\n• रिश्तों की समस्याएं और पारिवारिक संघर्ष\n• खोया हुआ, खाली या फंसा हुआ महसूस करना\n• बेहतर आदतें और आत्मविश्वास बनाना\n\n**निष्कर्ष:** थेरेपी के लिए जाना आत्म-जागरूकता और साहस का प्रतीक है — कमज़ोरी का नहीं।`,
    },
    tags: ["therapy", "stigma", "mental health"],
  },
  {
    id: "log-kya-kahenge",
    category: "family",
    emoji: "👨‍👩‍👧",
    title: {
      en: "How to talk to your family about mental health",
      hi: "परिवार से मानसिक स्वास्थ्य के बारे में कैसे बात करें",
    },
    summary: {
      en: "'Log kya kahenge' (what will people say) is a real fear. Here's how to have the conversation that matters.",
      hi: "'लोग क्या कहेंगे' एक असली डर है। यहाँ बताया गया है कि वह बातचीत कैसे करें जो मायने रखती है।",
    },
    body: {
      en: `Starting a mental health conversation with Indian parents or elders can feel impossible. Here are gentle ways to open the door:\n\n**1. Use physical language first**\nSay "I've been feeling tired and getting headaches" before "I'm feeling depressed." Physical symptoms are more accepted.\n\n**2. Reference someone they respect**\n"My friend's doctor said stress can affect the heart..." introduces the topic without making it personal.\n\n**3. Pick the right moment**\nNot during a fight. Not at dinner. A quiet, calm moment — maybe during a walk or drive.\n\n**4. Be specific, not dramatic**\n"I've been struggling to focus during my studies" lands better than "I'm not okay."\n\n**5. Give them time**\nThey may react with dismissal at first. That's okay. Plant the seed and revisit later.\n\nRemember: Your parents likely didn't grow up with mental health language. Be patient — this is new for them too.`,
      hi: `भारतीय माता-पिता या बुजुर्गों के साथ मानसिक स्वास्थ्य की बातचीत शुरू करना मुश्किल लग सकता है। यहाँ कुछ तरीके हैं:\n\n**1. पहले शारीरिक भाषा का उपयोग करें**\n"मुझे थकान हो रही है और सिरदर्द हो रहा है" कहें।\n\n**2. सही समय चुनें**\nझगड़े के दौरान नहीं। एक शांत, सुकून भरे पल में।\n\n**3. धैर्य रखें**\nवे पहले नकार सकते हैं। यह ठीक है। बीज बोएं और बाद में वापस आएं।`,
    },
    tags: ["family", "communication", "Indian parents"],
  },
  {
    id: "exam-anxiety",
    category: "academic",
    emoji: "📝",
    title: {
      en: "When exam pressure becomes too much",
      hi: "जब परीक्षा का दबाव बहुत अधिक हो जाए",
    },
    summary: {
      en: "JEE, NEET, boards, placements — Indian academic culture is one of the most high-pressure in the world. Here's what helps.",
      hi: "JEE, NEET, बोर्ड — भारतीय शैक्षणिक संस्कृति दुनिया में सबसे अधिक दबाव वाली है।",
    },
    body: {
      en: `India has one of the most competitive academic environments in the world. It's normal to feel anxious — but there's a difference between healthy pressure and harmful stress.\n\n**Signs your stress has crossed the line:**\n• You can't sleep even when exhausted\n• You feel a sense of dread every morning\n• You've stopped doing things you used to enjoy\n• You're snapping at loved ones constantly\n• You feel like you're "not good enough" even when you study hard\n\n**What actually helps:**\n• Study in focused 25-minute blocks (Pomodoro technique) with real breaks\n• Talk to one trusted person about how you're feeling — not your performance\n• Take a real day off each week — guilt-free\n• Remind yourself: your worth is not your rank\n\n**If you're in a crisis:** Talk to a counsellor. Most colleges have one. It's confidential.\n\nYou are more than your marks. This phase will pass.`,
      hi: `भारत में शैक्षणिक प्रतिस्पर्धा बहुत अधिक है। चिंतित महसूस करना सामान्य है — लेकिन स्वस्थ दबाव और हानिकारक तनाव में अंतर है।\n\n**क्या वास्तव में मदद करता है:**\n• 25 मिनट के फोकस ब्लॉक में पढ़ें\n• एक विश्वसनीय व्यक्ति से बात करें\n• हर हफ्ते एक दिन की वास्तविक छुट्टी लें\n• याद रखें: आपकी कीमत आपकी रैंक नहीं है`,
    },
    tags: ["JEE", "NEET", "exam stress", "academic pressure"],
  },
  {
    id: "asking-for-help",
    category: "seeking-help",
    emoji: "🤝",
    title: {
      en: "Asking for help is brave, not weak",
      hi: "मदद माँगना बहादुरी है, कमज़ोरी नहीं",
    },
    summary: {
      en: "In Indian culture, asking for help — especially emotional help — is often seen as a burden or weakness. Here's the truth.",
      hi: "भारतीय संस्कृति में मदद माँगना — खासकर भावनात्मक मदद — अक्सर बोझ या कमज़ोरी के रूप में देखा जाता है।",
    },
    body: {
      en: `We grow up hearing "handle it yourself," "don't be dramatic," or "everyone has problems." These messages — though often loving in intent — can make it very hard to ask for help.\n\n**The cost of not asking:**\n• Small problems grow into big ones\n• You feel more isolated and alone\n• Your mental health silently deteriorates\n• You miss out on connections that could help\n\n**The truth about asking for help:**\n• It takes courage to be vulnerable\n• It shows emotional intelligence\n• It builds deeper relationships\n• It literally saves lives\n\n**Where to start:**\n1. A trusted friend or sibling\n2. A school or college counsellor\n3. A helpline like iCall (9152987821) — anonymous, trained, free\n4. This app — you're already here, which is a step\n\n**You don't have to carry this alone.**`,
      hi: `हम "खुद संभालो," "नाटक मत करो," जैसी बातें सुनते हुए बड़े होते हैं।\n\n**मदद न माँगने की कीमत:**\n• छोटी समस्याएं बड़ी हो जाती हैं\n• आप अधिक अकेले महसूस करते हैं\n\n**मदद माँगने की सच्चाई:**\n• इसके लिए साहस चाहिए\n• यह भावनात्मक बुद्धिमत्ता दर्शाता है\n• यह जीवन बचाता है\n\n**आपको यह अकेले नहीं उठाना है।**`,
    },
    tags: ["seeking help", "vulnerability", "courage"],
  },
  {
    id: "self-care-india",
    category: "self-care",
    emoji: "🌸",
    title: {
      en: "Self-care that actually fits your life",
      hi: "आत्म-देखभाल जो आपकी जीवनशैली में फिट हो",
    },
    summary: {
      en: "Self-care isn't bubble baths and candles. Here are simple, culturally relevant ways to take care of your mental wellbeing.",
      hi: "आत्म-देखभाल का मतलब बुलबुले वाले स्नान नहीं है। यहाँ कुछ सरल, सांस्कृतिक रूप से प्रासंगिक तरीके हैं।",
    },
    body: {
      en: `"Self-care" can sound foreign or privileged. But it really means: doing small things regularly that help you stay functional and feel human.\n\n**5-minute practices that work:**\n• Take 5 slow, deep breaths before you check your phone in the morning\n• Write one sentence about how you're feeling — just one\n• Drink a full glass of water before any meal\n• Step outside for 2 minutes and look at the sky\n• Call or text one person you care about\n\n**Culturally grounded anchors:**\n• Morning prayers or meditation (if it's part of your practice)\n• Chai time as a deliberate pause — not just a habit\n• Weekly temple or community visits as social connection\n\n**One rule:**\nIf it reliably makes you feel a bit better without hurting you or others — it counts as self-care.\n\nStart with one thing. Just one.`,
      hi: `"आत्म-देखभाल" का वास्तव में मतलब है: नियमित रूप से छोटी चीज़ें करना जो आपको कार्यात्मक और मानवीय महसूस कराने में मदद करती हैं।\n\n**5 मिनट की प्रथाएं:**\n• सुबह फोन चेक करने से पहले 5 गहरी साँसें लें\n• एक वाक्य लिखें कि आप कैसा महसूस कर रहे हैं\n• बाहर 2 मिनट के लिए कदम रखें\n\nएक चीज़ से शुरू करें। बस एक।`,
    },
    tags: ["self-care", "daily habits", "wellbeing"],
  },
  {
    id: "depression-not-laziness",
    category: "myths",
    emoji: "🌧️",
    title: {
      en: "Depression is not laziness",
      hi: "अवसाद आलस्य नहीं है",
    },
    summary: {
      en: "Being told to 'just work harder' when you're depressed is not only unhelpful — it's harmful. Here's what depression actually looks like.",
      hi: "डिप्रेशन में होने पर 'बस मेहनत करो' कहना न केवल अनुपयोगी है — यह हानिकारक है।",
    },
    body: {
      en: `Depression is not a character flaw, a phase, or an excuse to avoid work. It's a medical condition that affects how the brain functions.\n\n**What depression can look like in Indian youth:**\n• Losing interest in studies that you used to enjoy\n• Feeling exhausted even after sleeping 10+ hours\n• Eating too much or too little\n• Feeling worthless or like a burden to your family\n• Having trouble concentrating — like your brain is in fog\n• Withdrawing from friends and becoming irritable\n\n**What does NOT help:**\n• "Ladkon ko nahi rona chahiye" (Boys shouldn't cry)\n• "Itna hi padha hai, aur padh" (You haven't studied enough, study more)\n• "Bahar jao, theek ho jaoge" (Go outside, you'll be fine)\n\n**What does help:**\n• Professional support (therapy, and sometimes medication)\n• Regular movement, sleep, and sunlight\n• Talking to one trusted person\n\nIf you think you might be depressed, please reach out to a counsellor or helpline. You deserve support.`,
      hi: `अवसाद एक चरित्र दोष, एक चरण, या काम से बचने का बहाना नहीं है। यह एक चिकित्सा स्थिति है।\n\n**भारतीय युवाओं में अवसाद कैसा दिख सकता है:**\n• उन पढ़ाई में रुचि खोना जो आपको पहले पसंद थी\n• 10+ घंटे सोने के बाद भी थकान महसूस करना\n• परिवार पर बोझ जैसा महसूस करना\n\nअगर आपको लगता है कि आप उदास हो सकते हैं, तो कृपया किसी परामर्शदाता या हेल्पलाइन से संपर्क करें।`,
    },
    tags: ["depression", "myths", "mental illness"],
  },
  {
    id: "men-mental-health",
    category: "myths",
    emoji: "💪",
    title: {
      en: "Men feel pain too — and that's okay",
      hi: "पुरुष भी दर्द महसूस करते हैं — और यह ठीक है",
    },
    summary: {
      en: "Indian men are often expected to suppress emotions. This has a serious cost — on their mental health, relationships, and lives.",
      hi: "भारतीय पुरुषों से अक्सर भावनाओं को दबाने की उम्मीद की जाती है। इसका गंभीर परिणाम होता है।",
    },
    body: {
      en: `"Mard ko dard nahi hota." (Men don't feel pain.)\nThis saying has done more harm than we realise.\n\nMen in India often go through:\n• Career and financial pressure entirely alone\n• Relationship breakdowns without emotional support\n• Mental health struggles without ever naming them\n• Substance use as the only outlet\n\n**The numbers are stark:**\nMen account for ~70% of suicide deaths in India — partly because they're less likely to seek help.\n\n**You are allowed to:**\n• Feel hurt, sad, scared, or overwhelmed\n• Cry — it's a physiological release, not a weakness\n• Ask for help without it meaning you've failed\n• Need support without needing to "fix" everything first\n\nStrength is knowing when you need support. That's what real courage looks like.`,
      hi: `"मर्द को दर्द नहीं होता।"\nयह कहावत हमारी सोच से ज़्यादा नुकसान कर चुकी है।\n\n**आपको यह करने की अनुमति है:**\n• दुखी, डरा हुआ या अभिभूत महसूस करना\n• रोना — यह कमज़ोरी नहीं है\n• बिना असफल हुए महसूस किए मदद माँगना\n\nताकत यह जानना है कि आपको कब समर्थन की ज़रूरत है।`,
    },
    tags: ["men's mental health", "toxic masculinity", "stigma"],
  },
  {
    id: "anxiety-vs-worry",
    category: "myths",
    emoji: "⚡",
    title: {
      en: "The difference between normal worry and anxiety",
      hi: "सामान्य चिंता और एंग्ज़ाइटी में अंतर",
    },
    summary: {
      en: "Everyone worries. But anxiety is different — and knowing the difference can help you get the right support.",
      hi: "सभी को चिंता होती है। लेकिन एंग्ज़ाइटी अलग है — और यह अंतर जानना आपको सही सहायता पाने में मदद कर सकता है।",
    },
    body: {
      en: `**Normal worry:**\n• Is triggered by a specific situation (exam, interview, conflict)\n• Comes and goes\n• Doesn't significantly interfere with daily life\n• Resolves once the situation resolves\n\n**Anxiety (when to seek help):**\n• Is persistent and hard to control\n• Can occur without a clear trigger\n• Causes physical symptoms: racing heart, chest tightness, sweating, nausea\n• Interferes with sleep, concentration, and relationships\n• Causes avoidance of situations you used to manage fine\n\n**What helps anxiety:**\n• Breathing exercises (box breathing, 4-7-8 technique)\n• Regular exercise and sufficient sleep\n• Limiting caffeine and social media\n• Therapy (especially CBT — Cognitive Behavioural Therapy)\n• In some cases, medication from a psychiatrist\n\nIf you recognise yourself in the anxiety description, please speak to a counsellor. You don't have to white-knuckle through it.`,
      hi: `**सामान्य चिंता:**\n• किसी विशेष स्थिति से शुरू होती है\n• आती-जाती रहती है\n\n**एंग्ज़ाइटी:**\n• लगातार और नियंत्रित करना मुश्किल\n• शारीरिक लक्षण पैदा कर सकती है\n• नींद और ध्यान में बाधा डालती है\n\nअगर आप एंग्ज़ाइटी में हैं, तो कृपया किसी परामर्शदाता से बात करें।`,
    },
    tags: ["anxiety", "worry", "mental health education"],
  },
]

// ─── Crisis Resources ──────────────────────────────────────────────────────────

const CRISIS_RESOURCES = [
  { name: "Tele-MANAS", number: "14416", desc: "Govt. of India · Free · 24/7 · Hindi & English", color: "from-red-500 to-orange-500" },
  { name: "iCall (TISS)", number: "9152987821", desc: "Mon–Sat, 8am–10pm · Trained counsellors", color: "from-orange-500 to-amber-500" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", desc: "24/7 · Hindi & English", color: "from-amber-500 to-yellow-500" },
  { name: "AASRA", number: "9820466627", desc: "24/7 · For emotional support", color: "from-yellow-500 to-lime-500" },
]

// ─── Components ───────────────────────────────────────────────────────────────

function ArticleCard({ article, lang }: { article: Article; lang: Language }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="text-3xl flex-shrink-0 mt-0.5">{article.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-foreground leading-snug mb-1.5">
            {article.title[lang]}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {article.summary[lang]}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {article.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t bg-muted/30">
              <div className="pt-4 text-sm text-foreground leading-relaxed whitespace-pre-line">
                {article.body[lang]}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const [lang, setLang] = useState<Language>("en")
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredArticles = activeCategory === "all"
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory)

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold">
          {lang === "en" ? "Mental Health Resource Hub" : "मानसिक स्वास्थ्य संसाधन केंद्र"}
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
          {lang === "en"
            ? "Real, honest articles about mental health for Indian youth — no jargon, no shame."
            : "भारतीय युवाओं के लिए मानसिक स्वास्थ्य पर सच्चे, ईमानदार लेख — कोई जटिल शब्द नहीं, कोई शर्म नहीं।"}
        </p>

        {/* Language Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <div className="flex rounded-xl border p-1 gap-1 bg-muted/50">
            {(["en", "hi"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  lang === l
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={lang === l}
              >
                {l === "en" ? "English" : "हिन्दी"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crisis Resources Banner */}
      <div className="rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <h2 className="font-semibold text-red-700 dark:text-red-400 text-sm">
            {lang === "en" ? "If you're in crisis right now" : "अगर आप अभी संकट में हैं"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CRISIS_RESOURCES.map((r) => (
            <a
              key={r.number}
              href={`tel:${r.number.replace(/-/g, "")}`}
              className="group flex items-center gap-3 p-3 rounded-xl bg-white/70 dark:bg-black/20 border border-red-100 dark:border-red-900/40 hover:bg-white dark:hover:bg-black/30 transition-all"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center flex-shrink-0`}>
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.name}</p>
                <p className="text-base font-bold text-red-600 dark:text-red-400 leading-none">{r.number}</p>
                <p className="text-[10px] text-gray-500">{r.desc}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
        <p className="text-xs text-red-500/70 mt-2.5 text-center">
          {lang === "en"
            ? "All helplines are free, confidential, and available in Hindi & English."
            : "सभी हेल्पलाइन मुफ्त, गोपनीय और हिन्दी और अंग्रेजी में उपलब्ध हैं।"}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:text-foreground border-transparent hover:border-border"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label[lang]}</span>
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-1">📭</p>
            <p className="text-sm">
              {lang === "en" ? "No articles in this category yet." : "इस श्रेणी में अभी कोई लेख नहीं है।"}
            </p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} lang={lang} />
          ))
        )}
      </div>

      {/* Footer Note */}
      <div className="rounded-xl border bg-muted/30 p-4 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {lang === "en"
            ? "⚠️ These articles are for educational purposes only and are not a substitute for professional mental health support. If you're struggling, please speak to a counsellor or call a helpline."
            : "⚠️ ये लेख केवल शैक्षिक उद्देश्यों के लिए हैं और पेशेवर मानसिक स्वास्थ्य समर्थन का विकल्प नहीं हैं।"}
        </p>
      </div>
    </div>
  )
}
