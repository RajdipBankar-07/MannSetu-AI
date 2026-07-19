"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Sparkles, ArrowRight, Lock, Mail, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupForm = z.infer<typeof signupSchema>

const passwordStrength = (password: string) => {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsLoading(false)
    toast({ title: "Account created! 🎉", description: "Please verify your email to continue." })
    router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`)
  }

  const strength = passwordStrength(password)
  const strengthColors = ["bg-[#EF4444]", "bg-[#F59E0B]", "bg-[#F59E0B]", "bg-[#22C55E]", "bg-[#22C55E]"]
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12">
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
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Start your free mental wellness journey</p>
          </div>

          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Priya Sharma"
                      className={cn("pl-10", errors.name && "border-destructive")}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="priya@example.com"
                      className={cn("pl-10", errors.email && "border-destructive")}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                      {...register("password", {
                        onChange: (e) => setPassword(e.target.value),
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all duration-300",
                              i < strength ? strengthColors[strength] : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength: <span className="font-medium">{strengthLabels[strength]}</span>
                      </p>
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className={cn("pl-10", errors.confirmPassword && "border-destructive")}
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" id="terms" className="mt-0.5 rounded" required />
                  <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full mt-2"
                  size="lg"
                  disabled={isLoading}
                  id="signup-submit-btn"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Free Account <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                Free forever · No credit card · End-to-end encrypted
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
