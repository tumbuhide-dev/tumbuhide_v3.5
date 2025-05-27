import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Crown,
  ExternalLink,
  User,
  Mail,
  Calendar,
  Activity,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface ProfileInfoProps {
  profile: {
    username: string;
    full_name: string;
    email: string;
    plan: string;
    created_at: string;
    is_verified: boolean;
  };
  onUpgrade: (code: string) => Promise<void>;
}

export function ProfileInfo({ profile, onUpgrade }: ProfileInfoProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Kode Undangan Diperlukan",
        description: "Silakan masukkan kode undangan yang valid",
        variant: "destructive",
      });
      return;
    }

    setIsUpgrading(true);
    try {
      await onUpgrade(inviteCode);
      setInviteCode("");
    } catch (error) {
      toast({
        title: "Gagal Upgrade",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat upgrade",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/${profile.username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "URL Profil Disalin!",
        description: "Link profil Anda telah disalin ke clipboard",
      });
    } catch (error) {
      toast({
        title: "Gagal menyalin URL",
        description: "Silakan salin URL secara manual",
        variant: "destructive",
      });
    }
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-500/5 to-yellow-500/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">
              Informasi Profil
            </CardTitle>
            <CardDescription>Detail dan status akun Anda</CardDescription>
          </div>
          <Badge
            variant={profile.plan === "pro" ? "default" : "secondary"}
            className="text-sm font-medium px-4 py-1 rounded-full shadow-md bg-gradient-to-r from-purple-500 to-yellow-500 text-white border-0"
          >
            {profile.plan === "pro" ? (
              <span className="flex items-center gap-1">
                <Crown className="w-4 h-4" /> Premium
              </span>
            ) : (
              "Basic"
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Nama Pengguna
              </label>
              <div className="font-medium">@{profile.username}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Bergabung Sejak
              </label>
              <div className="font-medium">{joinDate}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Status
              </label>
              <div>
                <Badge variant="outline" className="font-normal">
                  {profile.is_verified ? "Terverifikasi" : "Aktif"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <Button
              variant="outline"
              onClick={handleShareProfile}
              className="w-full bg-gradient-to-r hover:from-purple-50 hover:to-yellow-50 dark:hover:from-purple-900/20 dark:hover:to-yellow-900/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan Profil
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full bg-gradient-to-r hover:from-purple-50 hover:to-yellow-50 dark:hover:from-purple-900/20 dark:hover:to-yellow-900/20"
            >
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Lihat Profil Saya
              </Link>
            </Button>
          </div>

          {profile.plan === "basic" && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Upgrade ke Creator Pro untuk mendapatkan fitur premium:
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Video Showcase</li>
                  <li>Social Analytics</li>
                  <li>Tema Kustom</li>
                  <li>Prioritas Dukungan</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode undangan"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <Button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white hover:from-purple-700 hover:to-yellow-600"
                >
                  {isUpgrading ? "Memproses..." : "Upgrade"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
