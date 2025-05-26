"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogOut, Check, X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Daftar kota-kota besar di Indonesia
const INDONESIAN_CITIES = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Bekasi",
  "Medan",
  "Depok",
  "Tangerang",
  "Palembang",
  "Semarang",
  "Makassar",
  "Batam",
  "Bogor",
  "Pekanbaru",
  "Bandar Lampung",
  "Malang",
  "Padang",
  "Yogyakarta",
  "Denpasar",
  "Samarinda",
  "Banjarmasin",
  "Tasikmalaya",
  "Pontianak",
  "Cimahi",
  "Balikpapan",
  "Jambi",
  "Surakarta",
  "Manado",
  "Kupang",
  "Serang",
  "Purwokerto",
  "Cirebon",
  "Sukabumi",
  "Jember",
  "Palu",
  "Mataram",
  "Kediri",
  "Jayapura",
  "Bengkulu",
  "Dumai",
  "Kendari",
  "Tegal",
  "Binjai",
  "Pekalongan",
  "Banda Aceh",
  "Lubuklinggau",
  "Gorontalo",
  "Madiun",
  "Sibolga",
  "Tanjung Pinang",
  "Lhokseumawe",
  "Langsa",
  "Tarakan",
  "Sorong",
  "Ternate",
  "Ambon",
]

const PRONOUNS_OPTIONS = [
  { value: "dia/dia", label: "Dia/Dia" },
  { value: "ia/ia", label: "Ia/Ia" },
  { value: "mereka/mereka", label: "Mereka/Mereka" },
  { value: "laki-laki", label: "Laki-laki" },
  { value: "perempuan", label: "Perempuan" },
]

interface CompleteProfileFormProps {
  userId: string
  userEmail: string
}

export function CompleteProfileForm({ userId, userEmail }: CompleteProfileFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    tagline: "",
    location: "",
    birthYear: "", // Changed from birthDate to birthYear
    pronouns: "",
  })
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [citySearch, setCitySearch] = useState("")

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Generate years for birth year (17 years old minimum)
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 17 // Max age allowed
  const maxYear = currentYear - 80 // Min age allowed
  const years = Array.from({ length: minYear - maxYear + 1 }, (_, i) => minYear - i)

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus("unavailable")
      return
    }

    // Check for forbidden usernames
    const forbiddenUsernames = [
      "admin",
      "root",
      "api",
      "www",
      "mail",
      "ftp",
      "localhost",
      "test",
      "demo",
      "support",
      "help",
      "info",
      "contact",
      "about",
      "blog",
      "news",
      "shop",
      "store",
      "app",
      "mobile",
      "web",
      "site",
      "page",
      "tumbuhide",
      "tumbuh",
      "ide",
      "creator",
      "brand",
      "partnership",
    ]

    if (forbiddenUsernames.includes(username.toLowerCase())) {
      setUsernameStatus("unavailable")
      return
    }

    setUsernameStatus("checking")

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Username check error:", error)
        setUsernameStatus("unavailable")
        return
      }

      if (data) {
        setUsernameStatus("unavailable")
      } else {
        setUsernameStatus("available")
      }
    } catch (error) {
      console.error("Error checking username:", error)
      setUsernameStatus("unavailable")
    }
  }

  useEffect(() => {
    if (formData.username) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(formData.username)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setUsernameStatus("idle")
    }
  }, [formData.username])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (usernameStatus !== "available") {
      setError("Username tidak tersedia atau tidak valid")
      setLoading(false)
      return
    }

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle()

      const profileData = {
        username: formData.username.toLowerCase(),
        full_name: formData.fullName,
        tagline: formData.tagline || null,
        location: formData.location || null,
        birth_year: formData.birthYear ? Number.parseInt(formData.birthYear) : null, // Convert to integer
        pronouns: formData.pronouns || null,
        updated_at: new Date().toISOString(),
      }

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase.from("profiles").update(profileData).eq("id", userId)

        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase.from("profiles").insert({
          id: userId,
          email: userEmail,
          role: "content_creator",
          plan: "basic",
          ...profileData,
          created_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      // Redirect ke plan selection
      router.push("/plan-selection")
    } catch (error: any) {
      console.error("Profile save error:", error)
      setError(error.message || "Terjadi kesalahan saat menyimpan profil")
    } finally {
      setLoading(false)
    }
  }

  const filteredCities = INDONESIAN_CITIES.filter((city) => city.toLowerCase().includes(citySearch.toLowerCase()))

  const isFormValid = formData.username.length >= 3 && formData.fullName.trim() && usernameStatus === "available"

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Lengkapi Profil</CardTitle>
            <CardDescription>Informasi ini akan ditampilkan di profil publik Anda</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="username_anda"
                value={formData.username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  setFormData((prev) => ({ ...prev, username: value }))
                }}
                maxLength={30}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                {usernameStatus === "available" && <Check className="h-4 w-4 text-green-500" />}
                {usernameStatus === "unavailable" && <X className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            {formData.username && formData.username.length < 3 && (
              <p className="text-sm text-red-500">Username minimal 3 karakter</p>
            )}
            {usernameStatus === "unavailable" && formData.username.length >= 3 && (
              <p className="text-sm text-red-500">Username tidak tersedia</p>
            )}
            {usernameStatus === "available" && <p className="text-sm text-green-500">Username tersedia</p>}
            <p className="text-xs text-gray-500">URL profil Anda: tumbuhide.com/{formData.username}</p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap *</Label>
            <Input
              id="fullName"
              placeholder="Nama lengkap Anda"
              value={formData.fullName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              maxLength={100}
              required
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Textarea
              id="tagline"
              placeholder="Ceritakan tentang diri Anda dalam satu kalimat"
              value={formData.tagline}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
              maxLength={150}
              rows={2}
            />
            <p className="text-xs text-gray-500">Opsional - bisa diubah nanti</p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kota Anda" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Cari kota..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {filteredCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Birth Year */}
          <div className="space-y-2">
            <Label htmlFor="birthYear">Tahun Lahir</Label>
            <Select
              value={formData.birthYear}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, birthYear: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun lahir" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Minimal umur 17 tahun</p>
          </div>

          {/* Pronouns */}
          <div className="space-y-2">
            <Label htmlFor="pronouns">Kata Ganti</Label>
            <Select
              value={formData.pronouns}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, pronouns: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kata ganti" />
              </SelectTrigger>
              <SelectContent>
                {PRONOUNS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !isFormValid}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lanjutkan ke Pemilihan Paket
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
