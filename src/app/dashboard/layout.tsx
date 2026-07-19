import type { Metadata } from "next"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export const metadata: Metadata = {
  title: "Dashboard – MannSetu AI",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
