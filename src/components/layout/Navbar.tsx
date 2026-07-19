"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  Sparkles,
  X,
  LayoutDashboard,
  MessageCircle,
  Smile,
  BookOpen,
  Wind,
  Heart,
  Users,
  BookMarked,
  Settings,
  User,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebarStore } from "@/store/sidebar"
import { useAuthStore } from "@/store/auth"
import { getInitials, cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageCircle },
  { href: "/dashboard/mood", label: "Mood", icon: Smile },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/wellness", label: "Wellness", icon: Heart },
  { href: "/dashboard/meditation", label: "Meditate", icon: Wind },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/resources", label: "Resources", icon: BookMarked },
  { href: "/dashboard/emergency", label: "Emergency", icon: Phone },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Navbar() {
  const { toggleMobile, isMobileOpen, toggle } = useSidebarStore()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const getPageTitle = () => {
    const map: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/dashboard/chat": "AI Chat",
      "/dashboard/mood": "Mood Tracker",
      "/dashboard/journal": "Daily Journal",
      "/dashboard/wellness": "Wellness Plan",
      "/dashboard/meditation": "Meditation",
      "/dashboard/community": "Community",
      "/dashboard/resources": "Resources",
      "/dashboard/analytics": "Analytics",
      "/dashboard/notifications": "Notifications",
      "/dashboard/profile": "Profile",
      "/dashboard/settings": "Settings",
      "/dashboard/emergency": "Emergency Help",
      "/dashboard/admin": "Admin Dashboard",
    }
    return map[pathname] ?? "Dashboard"
  }

  const handleLogout = () => {
    logout()
    toast({ title: "Signed out" })
    router.push("/login")
  }

  return (
    <>
      <header className="h-16 border-b bg-card/95 backdrop-blur-sm sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6">
        {/* Desktop toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden md:flex"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={toggleMobile}
          aria-label="Open mobile menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        <div className="flex-1">
          <h1 className="text-sm font-semibold md:text-base">{getPageTitle()}</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] flex items-center justify-center">
                3
              </span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="ml-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs">{getInitials(user?.name ?? "U")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="purple" className="mt-1 text-[10px]">Pro Plan</Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="w-4 h-4 mr-2" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={toggleMobile}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r z-50 md:hidden overflow-y-auto"
            >
              <div className="flex items-center gap-3 px-4 h-16 border-b">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold gradient-text">MannSetu AI</span>
                <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={toggleMobile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <nav className="p-3 space-y-1">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon
                  const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={toggleMobile}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground"
                          : item.href === "/dashboard/emergency"
                          ? "text-[#EF4444] hover:bg-[#EF4444]/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{getInitials(user?.name ?? "U")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user?.name}</p>
                    <Badge variant="purple" className="text-[10px]">Pro</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
