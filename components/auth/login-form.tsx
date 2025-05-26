"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Check if profile exists and is complete
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, full_name, plan")
          .eq("id", data.user.id)
          .maybeSingle() // Fix: gunakan maybeSingle() instead of single()

        if (!profile) {
          // Profile belum ada, redirect ke complete-profile
          router.push("/complete-profile")
        } else if (!profile.username || !profile.full_name) {
          // Profile ada tapi belum lengkap
          router.push("/complete-profile")
        } else if (!profile.plan || profile.plan === "basic") {
          // Profile lengkap tapi belum pilih plan
          router.push("/plan-selection")
        } else {
          // Semua lengkap, ke dashboard
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Terjadi kesalahan saat masuk")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk Akun</CardTitle>
        <CardDescription>Masukkan email dan password Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Masuk
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Belum punya akun? </span>
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Daftar di sini
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
