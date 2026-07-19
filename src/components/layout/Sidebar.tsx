"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  MessageCircle,
  Smile,
  BookOpen,
  Wind,
  Heart,
  Users,
  BookMarked,
  BarChart2,
  Bell,
  Settings,
  User,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  Gamepad,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSidebarStore } from "@/store/sidebar"
import { useAuthStore } from "@/store/auth"
import { getInitials, cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageCircle, badge: "AI" },
  { href: "/dashboard/mood", label: "Mood Tracker", icon: Smile },
  { href: "/dashboard/journal", label: "Daily Journal", icon: BookOpen },
  { href: "/dashboard/wellness", label: "Wellness Plan", icon: Heart },
  { href: "/dashboard/games", label: "Wellness Games", icon: Gamepad },
  { href: "/dashboard/meditation", label: "Meditation", icon: Wind },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/resources", label: "Resources", icon: BookMarked },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
]

const bottomItems = [
  { href: "/dashboard/emergency", label: "Emergency Help", icon: Phone, danger: true },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, notifCount: 3 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/admin", label: "Admin", icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarStore()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    toast({ title: "Signed out", description: "See you next time!" })
    router.push("/login")
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300 shrink-0",
          isOpen ? "w-60" : "w-16"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 border-b px-4", isOpen ? "gap-2.5" : "justify-center")}>
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-sm gradient-text overflow-hidden whitespace-nowrap"
              >
                MannSetu AI
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={toggle}
            className={cn(
              "ml-auto w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors",
              !isOpen && "hidden"
            )}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Expand button when collapsed */}
        {!isOpen && (
          <button
            onClick={toggle}
            className="mx-auto mt-2 w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const navItem = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  !isOpen && "justify-center px-2"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isOpen && item.badge && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary-foreground/20 text-primary-foreground border-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )

            if (!isOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return navItem
          })}
        </nav>

        {/* Bottom nav */}
        <div className="border-t px-2 py-3 space-y-0.5">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const navItem = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground"
                    : item.danger
                    ? "text-[#EF4444] hover:bg-[#EF4444]/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  !isOpen && "justify-center px-2"
                )}
              >
                <div className="relative shrink-0">
                  <Icon className="w-4 h-4" />
                  {item.notifCount && isOpen && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] flex items-center justify-center">
                      {item.notifCount}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isOpen && item.notifCount && (
                  <Badge variant="danger" className="text-[10px] px-1.5 py-0 h-4">
                    {item.notifCount}
                  </Badge>
                )}
              </Link>
            )

            if (!isOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return navItem
          })}
        </div>

        {/* User footer */}
        <div className={cn("border-t p-3", !isOpen && "flex justify-center")}>
          {isOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs">{getInitials(user?.name ?? "U")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer" onClick={handleLogout}>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs">{getInitials(user?.name ?? "U")}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
