"use client"

import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"
import { FloatingAIAssistant } from "@/components/floating/FloatingAIAssistant"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      <FloatingAIAssistant />
    </div>
  )
}
