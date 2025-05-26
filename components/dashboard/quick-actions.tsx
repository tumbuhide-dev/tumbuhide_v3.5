"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  ExternalLink,
  Crown,
  Sparkles,
  BarChart3,
  LinkIcon,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  profile: {
    id: string;
    username: string;
    full_name: string;
    plan: string;
    is_verified: boolean;
  };
}

export function QuickActions({ profile }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const supabase = createClientComponentClient();

  const profileUrl = `${BRAND.SITE_URL}/${profile.username}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleUpgrade = async () => {
    if (!inviteCode.trim()) {
      setError("Masukkan kode undangan");
      return;
    }

    setUpgrading(true);
    setError("");
    setSuccess("");

    try {
      // Validate invite code
      const { data: codeData, error: codeError } = await supabase
        .from("invite_codes")
        .select("*")
        .eq("code", inviteCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (codeError || !codeData) {
        throw new Error("Kode undangan tidak valid atau sudah tidak aktif");
      }

      if (codeData.plan_type !== "pro") {
        throw new Error("Kode undangan ini tidak untuk upgrade ke Pro");
      }

      if (codeData.current_uses >= codeData.max_uses) {
        throw new Error("Kode undangan sudah mencapai batas penggunaan");
      }

      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        throw new Error("Kode undangan sudah kedaluwarsa");
      }

      // Update user plan
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ plan: "pro" })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Update invite code usage
      await supabase
        .from("invite_codes")
        .update({
          current_uses: codeData.current_uses + 1,
          used_by: profile.id,
          used_at: new Date().toISOString(),
        })
        .eq("id", codeData.id);

      setSuccess("Selamat! Akun Anda berhasil diupgrade ke Creator Pro!");
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Kelola profil dan konten Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              asChild
              className="h-auto p-4 flex-col gap-2"
            >
              <Link href="/dashboard/profile">
                <Users className="w-6 h-6" />
                <span className="text-sm">Edit Profil</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="h-auto p-4 flex-col gap-2"
            >
              <Link href="/dashboard/social-links">
                <LinkIcon className="w-6 h-6" />
                <span className="text-sm">Social Links</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="h-auto p-4 flex-col gap-2"
            >
              <Link href="/dashboard/custom-links">
                <Sparkles className="w-6 h-6" />
                <span className="text-sm">Custom Links</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="h-auto p-4 flex-col gap-2"
            >
              <Link href="/dashboard/analytics">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">Analytics</span>
              </Link>
            </Button>

            {profile.plan === "pro" && (
              <Button
                variant="outline"
                asChild
                className="h-auto p-4 flex-col gap-2 md:col-span-2"
              >
                <Link href="/dashboard/showcase">
                  <Video className="w-6 h-6" />
                  <span className="text-sm">Video Showcase</span>
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-100 dark:bg-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profile.plan === "pro" && (
                  <Crown className="w-6 h-6 text-yellow-400" />
                )}
                Paket: {profile.plan === "pro" ? "Creator Pro" : "Basic"}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                {profile.plan === "pro"
                  ? "Anda memiliki akses ke semua fitur premium"
                  : "Upgrade untuk mendapatkan fitur lebih lengkap"}
              </CardDescription>
            </div>
            <Badge
              variant={profile.plan === "pro" ? "default" : "secondary"}
              className="text-sm font-medium px-3 py-1 rounded-full shadow-md"
            >
              {profile.plan === "pro" ? "Premium" : "Gratis"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-6 py-6">
          <div className="flex items-center gap-3">
            <Badge
              variant={profile.plan === "pro" ? "default" : "secondary"}
              className="text-sm font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1"
            >
              {profile.plan === "pro" && (
                <Crown className="w-4 h-4 text-yellow-400" />
              )}
              {profile.plan === "pro" ? "Creator Pro" : "Basic"}
            </Badge>
            {profile.is_verified && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 font-medium"
              >
                Verified
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Fitur Saat Ini */}
            <section>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 text-lg">
                Fitur Saat Ini:
              </h4>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {[
                  "Link profil custom",
                  "Social media links",
                  "Custom links unlimited",
                  "Analytics dasar",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}

                {profile.plan === "pro" && (
                  <>
                    {[
                      "Video showcase",
                      "Analytics advanced",
                      "Custom branding",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-purple-600 dark:text-purple-400"
                      >
                        <span className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </section>

            {/* Opsi Upgrade jika Basic */}
            {profile.plan === "basic" ? (
              <section className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-6 rounded-xl shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-200 text-lg">
                    Upgrade ke Creator Pro
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300 mb-6 text-sm">
                    Dapatkan fitur showcase video dan analytics advanced!
                  </p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Upgrade ke Creator Pro
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upgrade ke Creator Pro</DialogTitle>
                      <DialogDescription>
                        Dapatkan fitur showcase video dan analytics advanced!
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 mt-4">
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

                      <div>
                        <Label
                          htmlFor="invite-code"
                          className="mb-1 block font-medium"
                        >
                          Kode Undangan
                        </Label>
                        <Input
                          id="invite-code"
                          placeholder="Masukkan kode undangan"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          disabled={upgrading}
                          className="w-full"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleUpgrade}
                          disabled={upgrading || !inviteCode.trim()}
                          className="flex-1"
                        >
                          {upgrading ? "Memproses..." : "Upgrade Sekarang"}
                        </Button>

                        <Button variant="outline" asChild>
                          <Link href="/plan-selection">Lihat Paket</Link>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </section>
            ) : (
              <section className="md:col-span-2 text-center">
                <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl shadow-inner">
                  <p className="text-green-600 font-semibold text-lg">
                    ✨ Anda sudah menggunakan Creator Pro!
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">
                    Nikmati semua fitur premium tanpa batas
                  </p>
                </div>
              </section>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Link Profil Anda
          </CardTitle>
          <CardDescription>
            Bagikan link ini untuk menampilkan profil Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={profileUrl} readOnly className="flex-1" />
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="w-4 h-4" />
              {copied ? "Tersalin!" : "Salin"}
            </Button>
          </div>
          <Button asChild className="w-full">
            <Link href={`/${profile.username}`} target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              Lihat Profil
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
