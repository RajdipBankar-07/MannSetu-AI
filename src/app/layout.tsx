import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MannSetu AI – Your Confidential AI Companion for Mental Wellness",
  description:
    "MannSetu AI is a private, secure, and empathetic AI companion for mental wellness. Track your mood, journal your thoughts, meditate, and get personalized wellness plans.",
  keywords: ["mental wellness", "AI therapy", "mood tracker", "meditation", "mental health"],
  openGraph: {
    title: "MannSetu AI – Mental Wellness Companion",
    description: "Your confidential AI companion for mental wellness",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
