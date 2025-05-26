"use client"
import { useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface SettingsFormProps {
  profile: {
    id: string
    username: string
    email: string
    full_name: string
  }
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setSuccess("Password berhasil diubah!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat mengubah password")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "KONFIRMASI") {
      return
    }

    setLoading(true)
    try {
      // Delete profile first
      await supabase.from("profiles").delete().eq("id", profile.id)

      // Sign out user
      await supabase.auth.signOut()

      router.push("/")
    } catch (error: any) {
      setError("Gagal menghapus akun. Silakan coba lagi.")
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const isDeleteButtonEnabled = deleteConfirmation === "KONFIRMASI"

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>Informasi dasar akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input value={profile.username} disabled className="flex-1" />
                <Button variant="outline" size="sm" disabled className="sm:w-auto w-full">
                  Ubah
                </Button>
              </div>
              <p className="text-xs text-gray-500">Username tidak dapat diubah saat ini</p>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input value={profile.email} disabled className="flex-1" />
                <Button variant="outline" size="sm" disabled className="sm:w-auto w-full">
                  Ubah
                </Button>
              </div>
              <p className="text-xs text-gray-500">Email tidak dapat diubah saat ini</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>Perbarui password untuk keamanan akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Masukkan password saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password baru"
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

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ubah Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona Berbahaya</CardTitle>
          <CardDescription>Tindakan yang tidak dapat dibatalkan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-red-800 dark:text-red-200">Hapus Akun</h4>
              <p className="text-sm text-red-600 dark:text-red-300">
                Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen.
              </p>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2 w-full sm:w-auto">
                  <Trash2 className="w-4 h-4" />
                  Hapus Akun
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Konfirmasi Hapus Akun
                  </DialogTitle>
                  <DialogDescription className="text-left">
                    Tindakan ini akan menghapus akun Anda secara permanen beserta semua data yang terkait.
                    <br />
                    <br />
                    Ketik <strong>KONFIRMASI</strong> untuk melanjutkan:
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Input
                    placeholder="Ketik KONFIRMASI"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                  />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false)
                      setDeleteConfirmation("")
                    }}
                    className="w-full sm:w-auto"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={!isDeleteButtonEnabled || loading}
                    className="w-full sm:w-auto"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Hapus Akun
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
