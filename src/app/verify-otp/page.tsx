"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles, ArrowRight, RotateCcw, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Suspense } from "react"

function OTPVerifyContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? "your email"

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = Array.from({ length: 6 }, (_, i) => pastedData[i] ?? "")
      setOtp(newOtp)
      const lastIndex = Math.min(pastedData.length - 1, 5)
      inputRefs.current[lastIndex]?.focus()
    }
  }

  const handleVerify = async () => {
    if (otp.join("").length < 6) {
      toast({ title: "Enter complete OTP", description: "Please enter all 6 digits.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsLoading(false)
    toast({ title: "Verified! ✅", description: "Your account has been verified successfully." })
    router.push("/welcome-ai")
  }

  const handleResend = () => {
    setCountdown(60)
    setCanResend(false)
    setOtp(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
    toast({ title: "OTP resent", description: "A new code has been sent to your email." })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />

      <div className="w-full max-w-md px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">MannSetu AI</span>
            </Link>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleVerify}
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || otp.join("").length < 6}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify & Continue <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  {canResend ? (
                    <button
                      onClick={handleResend}
                      className="flex items-center gap-2 text-sm text-primary hover:underline mx-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Resend code
                    </button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Resend code in{" "}
                      <span className="font-medium text-foreground">{countdown}s</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Wrong email?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Go back
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function OTPVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <OTPVerifyContent />
    </Suspense>
  )
}
