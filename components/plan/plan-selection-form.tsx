"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, Star, LogOut } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface PlanSelectionFormProps {
  userId: string
}

export function PlanSelectionForm({ userId }: PlanSelectionFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">("basic")
  const [invitationCode, setInvitationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (selectedPlan === "pro") {
        // Validate invitation code
        if (!invitationCode.trim()) {
          throw new Error("Kode undangan diperlukan untuk paket Creator Pro")
        }

        // Check invitation code (you can customize this logic)
        const validCodes = ["CREATOR2024", "TUMBUHIDE2024", "INFLUENCER2024"]
        if (!validCodes.includes(invitationCode.toUpperCase())) {
          throw new Error("Kode undangan tidak valid")
        }
      }

      // Update user plan
      const { error } = await supabase
        .from("profiles")
        .update({
          plan: selectedPlan,
          invitation_code: selectedPlan === "pro" ? invitationCode.toUpperCase() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      // Redirect ke dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Plan selection error:", error)
      setError(error.message || "Terjadi kesalahan saat memilih paket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Plan */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedPlan === "basic" ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-gray-300"
          }`}
          onClick={() => setSelectedPlan("basic")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Basic</CardTitle>
              <Badge variant="secondary">Gratis</Badge>
            </div>
            <CardDescription>Sempurna untuk memulai journey sebagai content creator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">Rp 0</div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Link-in-bio dasar
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Maksimal 10 social links
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Maksimal 50 custom links
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Analytics dasar
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Responsive design
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card
          className={`cursor-pointer transition-all relative ${
            selectedPlan === "pro" ? "ring-2 ring-purple-500 border-purple-500" : "hover:border-gray-300"
          }`}
          onClick={() => setSelectedPlan("pro")}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-purple-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Populer
            </Badge>
          </div>

          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Creator Pro</CardTitle>
              <Badge variant="default" className="bg-purple-500">
                Undangan
              </Badge>
            </div>
            <CardDescription>Fitur lengkap untuk content creator profesional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-purple-600">Invite Only</div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Semua fitur Basic
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Unlimited social & custom links
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Video showcase dengan tabs
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Analytics advanced
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Custom branding
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Priority support
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedPlan === "pro" && (
          <div className="space-y-2">
            <Label htmlFor="invitationCode">Kode Undangan</Label>
            <Input
              id="invitationCode"
              placeholder="Masukkan kode undangan Creator Pro"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">Hubungi tim Tumbuhide.id untuk mendapatkan kode undangan</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {selectedPlan === "basic" ? "Mulai dengan Basic" : "Aktivasi Creator Pro"}
        </Button>
      </form>
    </div>
  )
}
