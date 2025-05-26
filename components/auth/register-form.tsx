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
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validasi
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      setLoading(false)
      return
    }

    if (!agreeTerms) {
      setError("Anda harus menyetujui syarat dan ketentuan")
      setLoading(false)
      return
    }

    try {
      // Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        setSuccess(true)
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Terjadi kesalahan saat mendaftar")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Pendaftaran Berhasil!</CardTitle>
          <CardDescription>Silakan cek email Anda untuk verifikasi akun.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Kami telah mengirim link verifikasi ke <strong>{email}</strong>
          </p>
          <Button onClick={() => router.push("/auth/login")} className="w-full">
            Kembali ke Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Akun</CardTitle>
        <CardDescription>Masukkan informasi Anda untuk membuat akun baru</CardDescription>
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
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              Saya setuju dengan{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                Syarat dan Ketentuan
              </Link>{" "}
              serta{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                Kebijakan Privasi
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Daftar Sekarang
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Sudah punya akun? </span>
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Masuk di sini
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
