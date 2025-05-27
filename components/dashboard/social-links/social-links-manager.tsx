"use client";
import { useState, useEffect } from "react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  ExternalLink,
  ArrowLeft,
  Crown,
  BarChart3,
  Edit,
  Instagram,
  Music,
  Facebook,
  Twitter,
  Youtube,
  MessageSquare,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { SECURITY } from "@/lib/constants";
import { validateURL, sanitizeInput } from "@/lib/security";
import Link from "next/link";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SocialLink {
  id: string;
  platform: string;
  username: string;
  url: string;
  display_order: number;
  updated_at: string;
}

interface AnalyticsData {
  saved_username: string;
  nickname?: string;
  avatar?: string;
  follower_count?: number;
}

interface SocialLinksManagerProps {
  userId: string;
  userPlan: string;
}

const SOCIAL_PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "@username",
    urlTemplate: "https://instagram.com/{username}",
    icon: Instagram,
    color: "#E4405F",
    darkColor: "#E4405F",
  },
  {
    value: "tiktok",
    label: "TikTok",
    placeholder: "@username",
    urlTemplate: "https://tiktok.com/@{username}",
    icon: Music,
    color: "#000000",
    darkColor: "#FFFFFF",
  },
  {
    value: "facebook",
    label: "Facebook",
    placeholder: "username",
    urlTemplate: "https://facebook.com/{username}",
    icon: Facebook,
    color: "#1877F2",
    darkColor: "#1877F2",
  },
  {
    value: "twitter",
    label: "Twitter/X",
    placeholder: "@username",
    urlTemplate: "https://twitter.com/{username}",
    icon: Twitter,
    color: "#1DA1F2",
    darkColor: "#1DA1F2",
  },
  {
    value: "youtube",
    label: "YouTube",
    placeholder: "@channel",
    urlTemplate: "https://youtube.com/@{username}",
    icon: Youtube,
    color: "#FF0000",
    darkColor: "#FF0000",
  },
  {
    value: "discord",
    label: "Discord",
    placeholder: "username#1234",
    urlTemplate: "https://discord.com/users/{username}",
    icon: MessageSquare,
    color: "#5865F2",
    darkColor: "#5865F2",
  },
];

export function SocialLinksManager({
  userId,
  userPlan,
}: SocialLinksManagerProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{
    instagram?: AnalyticsData;
    tiktok?: AnalyticsData;
  }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState({
    platform: "",
    username: "",
  });
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const maxLinks =
    userPlan === "pro"
      ? SECURITY.CONTENT_LIMITS.MAX_SOCIAL_LINKS_PRO
      : SECURITY.CONTENT_LIMITS.MAX_SOCIAL_LINKS_BASIC;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch existing social links using API
      const linksResponse = await fetch("/api/social-links");
      if (linksResponse.ok) {
        const linksResult = await linksResponse.json();
        setSocialLinks(linksResult.data || []);
      } else {
        console.error("Links fetch error:", linksResponse.statusText);
        setError("Terjadi gangguan server saat memuat data");
        return;
      }

      // Fetch analytics data for Instagram and TikTok (Pro users only)
      if (userPlan === "pro") {
        try {
          const [instagramResponse, tiktokResponse] = await Promise.allSettled([
            fetch("/api/social-analytics-data?platform=instagram"),
            fetch("/api/social-analytics-data?platform=tiktok"),
          ]);

          const analytics: any = {};

          // Handle Instagram data
          if (
            instagramResponse.status === "fulfilled" &&
            instagramResponse.value.ok
          ) {
            const instagramResult = await instagramResponse.value.json();
            if (instagramResult.data) {
              const data = instagramResult.data;
              analytics.instagram = {
                saved_username: data.saved_username,
                nickname: data.full_name || data.username,
                avatar: data.profile_pic_url,
                follower_count: data.follower_count,
              };
            }
          }

          // Handle TikTok data
          if (
            tiktokResponse.status === "fulfilled" &&
            tiktokResponse.value.ok
          ) {
            const tiktokResult = await tiktokResponse.value.json();
            if (tiktokResult.data) {
              const data = tiktokResult.data;
              analytics.tiktok = {
                saved_username: data.saved_username,
                nickname: data.nickname,
                avatar: data.avatar,
                follower_count: data.follower_count,
              };
            }
          }

          setAnalyticsData(analytics);
        } catch (analyticsError) {
          console.error("Analytics fetch error:", analyticsError);
          setAnalyticsData({});
        }
      }
    } catch (error: any) {
      console.error("Fetch data error:", error);
      setError("Terjadi gangguan server. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const generateURL = (platform: string, username: string): string => {
    const platformConfig = SOCIAL_PLATFORMS.find((p) => p.value === platform);
    if (!platformConfig) return "";

    const cleanUsername = sanitizeInput(
      username.replace("@", "").replace(/^https?:\/\//, "")
    );
    return platformConfig.urlTemplate.replace("{username}", cleanUsername);
  };

  const addSocialLink = async () => {
    if (!newLink.platform) {
      setError("Platform wajib dipilih");
      return;
    }

    if (!newLink.username.trim()) {
      setError("Username wajib diisi");
      return;
    }

    const cleanUsername = sanitizeInput(newLink.username.trim());
    if (!cleanUsername) {
      setError("Username tidak valid");
      return;
    }

    if (
      userPlan === "pro" &&
      (newLink.platform === "instagram" || newLink.platform === "tiktok")
    ) {
      setError(
        `Untuk ${
          newLink.platform === "instagram" ? "Instagram" : "TikTok"
        }, silakan atur di halaman Social Analytics`
      );
      return;
    }

    if (maxLinks !== -1 && socialLinks.length >= maxLinks) {
      setError(
        `Maksimal ${maxLinks} social links untuk paket ${
          userPlan === "pro" ? "Pro" : "Basic"
        }`
      );
      return;
    }

    if (socialLinks.some((link) => link.platform === newLink.platform)) {
      setError("Platform ini sudah ditambahkan");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const generatedURL = generateURL(newLink.platform, cleanUsername);

      if (!validateURL(generatedURL)) {
        setError("URL yang dihasilkan tidak valid");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/social-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: newLink.platform,
          username: cleanUsername.replace("@", ""),
          url: generatedURL,
          display_order: socialLinks.length,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSocialLinks([...socialLinks, result.data]);
        setNewLink({ platform: "", username: "" });
      } else {
        setError("Gagal menambahkan link. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Add link error:", error);
      setError("Terjadi gangguan server. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = async () => {
    if (!editingLink) return;

    const cleanUsername = sanitizeInput(editingLink.username.trim());
    if (!cleanUsername) {
      setError("Username tidak valid");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const generatedURL = generateURL(editingLink.platform, cleanUsername);

      if (!validateURL(generatedURL)) {
        setError("URL yang dihasilkan tidak valid");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/social-links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingLink.id,
          username: cleanUsername.replace("@", ""),
          url: generatedURL,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSocialLinks((links) =>
          links.map((link) => (link.id === editingLink.id ? result.data : link))
        );
        setShowEditDialog(false);
        setEditingLink(null);
      } else {
        setError("Gagal memperbarui link. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Update link error:", error);
      setError("Terjadi gangguan server. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSocialLink = async (id: string) => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/social-links?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSocialLinks(socialLinks.filter((link) => link.id !== id));
      } else {
        setError("Gagal menghapus link. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Delete link error:", error);
      setError("Terjadi gangguan server. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const getPlatformDisplay = (link: SocialLink) => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.value === link.platform);
    const IconComponent = platform?.icon || ExternalLink;

    return {
      name: platform?.label || link.platform,
      IconComponent,
      color: platform?.color || "#6B7280",
      darkColor: platform?.darkColor || platform?.color || "#6B7280",
    };
  };

  const formatFollowerCount = (count: number | undefined): string => {
    if (!count || count === 0) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const availablePlatforms = SOCIAL_PLATFORMS.filter((platform) => {
    if (
      userPlan === "pro" &&
      (platform.value === "instagram" || platform.value === "tiktok")
    ) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const selectedPlatform = SOCIAL_PLATFORMS.find(
    (p) => p.value === newLink.platform
  );
  const totalLinks =
    socialLinks.length +
    (analyticsData.instagram ? 1 : 0) +
    (analyticsData.tiktok ? 1 : 0);

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            asChild
            className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <ExternalLink className="w-8 h-8 text-yellow-300" />
                </div>
                <h1 className="text-3xl font-bold">Social Links</h1>
              </div>
              <p className="text-purple-100 max-w-2xl mx-auto">
                Kelola semua social media links Anda dalam satu tempat
              </p>
            </div>
          </div>
        </div>

        {/* Info Collapsible */}
        <Collapsible open={showInfo} onOpenChange={setShowInfo}>
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-blue-900 dark:text-blue-100">
                      Informasi & Cara Penggunaan
                    </CardTitle>
                  </div>
                  {showInfo ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      📋 Cara Penggunaan:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Pilih platform social media</li>
                      <li>• Masukkan username Anda</li>
                      <li>• Link akan otomatis terbuat</li>
                      <li>• Klik ikon untuk edit atau hapus</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      ⭐ Fitur Khusus Pro:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Instagram & TikTok dengan Analytics</li>
                      <li>• Data follower real-time</li>
                      <li>• Unlimited social links</li>
                      <li>• Insights mendalam</li>
                    </ul>
                  </div>
                </div>
                {userPlan === "basic" && (
                  <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      <strong>Upgrade ke Pro</strong> untuk mendapatkan
                      analytics Instagram & TikTok dengan data follower
                      real-time!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Plan Info */}
        <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-yellow-50 dark:from-purple-900/20 dark:to-yellow-900/20">
          <Crown className="h-4 w-4 text-purple-600" />
          <AlertDescription>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-purple-900 dark:text-purple-100">
                <strong>Paket {userPlan === "pro" ? "Pro" : "Basic"}:</strong>{" "}
                {totalLinks}/{maxLinks === -1 ? "∞" : maxLinks} social links
              </span>
              {userPlan === "basic" && (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-purple-300 hover:bg-purple-100"
                >
                  <Link href="/plan-selection">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Upgrade ke Pro
                  </Link>
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Analytics Links for Pro Users */}
        {userPlan === "pro" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Social Analytics Links
              </h3>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Link href="/dashboard/social/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Kelola Analytics
                </Link>
              </Button>
            </div>

            {!analyticsData.instagram && !analyticsData.tiktok ? (
              <Card className="border-dashed border-2 border-purple-300 bg-purple-50/50 dark:bg-purple-900/20">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Belum Ada Analytics Data
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">
                    Tambahkan username Instagram atau TikTok di halaman Social
                    Analytics untuk mendapatkan link otomatis dengan data
                    real-time
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Link href="/dashboard/social/analytics">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Setup Analytics Sekarang
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {/* Instagram Analytics Link */}
                {analyticsData.instagram && (
                  <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                              <Instagram className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="secondary"
                                className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100 text-xs"
                              >
                                Instagram Analytics
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div className="font-medium truncate">
                                @{analyticsData.instagram.saved_username}
                              </div>
                              <div className="text-xs text-pink-600 dark:text-pink-400 truncate">
                                {analyticsData.instagram.nickname && (
                                  <span>
                                    {analyticsData.instagram.nickname} •{" "}
                                  </span>
                                )}
                                {formatFollowerCount(
                                  analyticsData.instagram.follower_count
                                )}{" "}
                                followers
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/social/analytics">
                              <BarChart3 className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://instagram.com/${analyticsData.instagram.saved_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* TikTok Analytics Link */}
                {analyticsData.tiktok && (
                  <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 flex items-center justify-center">
                              <Music className="w-6 h-6 text-white dark:text-gray-800" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 text-xs"
                              >
                                TikTok Analytics
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div className="font-medium truncate">
                                @{analyticsData.tiktok.saved_username}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {analyticsData.tiktok.nickname && (
                                  <span>
                                    {analyticsData.tiktok.nickname} •{" "}
                                  </span>
                                )}
                                {formatFollowerCount(
                                  analyticsData.tiktok.follower_count
                                )}{" "}
                                followers
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/social/analytics">
                              <BarChart3 className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://tiktok.com/@${analyticsData.tiktok.saved_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add New Link */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50 dark:from-purple-900/20 dark:to-yellow-900/20">
            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Plus className="w-5 h-5" />
              Tambah Social Link Baru
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              {userPlan === "pro"
                ? "Tambahkan platform social media lainnya (Instagram & TikTok dikelola di Analytics)"
                : "Pilih platform dan masukkan username Anda"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  value={newLink.platform}
                  onValueChange={(value) =>
                    setNewLink({ ...newLink, platform: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((platform) => {
                      const IconComponent = platform.icon;
                      return (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent
                              className="w-4 h-4"
                              style={{
                                color:
                                  platform.value === "tiktok"
                                    ? "var(--foreground)"
                                    : platform.color,
                              }}
                            />
                            <span>{platform.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder={selectedPlatform?.placeholder || "@username"}
                  value={newLink.username}
                  onChange={(e) =>
                    setNewLink({ ...newLink, username: e.target.value })
                  }
                  required
                  maxLength={50}
                />
              </div>
            </div>

            <Button
              onClick={addSocialLink}
              disabled={
                saving ||
                !newLink.platform ||
                !newLink.username ||
                (maxLinks !== -1 && totalLinks >= maxLinks)
              }
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {saving ? "Menambahkan..." : "Tambah Social Link"}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Social Links Lainnya ({socialLinks.length})
          </h3>

          {socialLinks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Belum ada social links lainnya. Tambahkan yang pertama!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {socialLinks.map((link) => {
                const platformDisplay = getPlatformDisplay(link);
                const IconComponent = platformDisplay.IconComponent;

                return (
                  <Card
                    key={link.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              backgroundColor: platformDisplay.color,
                            }}
                          >
                            <IconComponent
                              className="w-5 h-5"
                              style={{
                                color:
                                  link.platform === "tiktok"
                                    ? platformDisplay.darkColor
                                    : "white",
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {platformDisplay.name}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div className="font-medium truncate">
                                @{link.username}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Buka Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingLink(link);
                              setShowEditDialog(true);
                            }}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <ConfirmationDialog
                            title="Konfirmasi Hapus Username"
                            description={`Apakah Anda yakin ingin menghapus ${platformDisplay.name} (@${link.username})? Anda dapat menambahkan username baru setelah menghapus yang ini.`}
                            onConfirm={() => deleteSocialLink(link.id)}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={saving}
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </ConfirmationDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Social Link</DialogTitle>
              <DialogDescription>
                Update username untuk platform ini
              </DialogDescription>
            </DialogHeader>
            {editingLink && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{
                        backgroundColor: getPlatformDisplay(editingLink).color,
                      }}
                    >
                      {React.createElement(
                        getPlatformDisplay(editingLink).IconComponent,
                        {
                          className: "w-4 h-4",
                          style: {
                            color:
                              editingLink.platform === "tiktok"
                                ? getPlatformDisplay(editingLink).darkColor
                                : "white",
                          },
                        }
                      )}
                    </div>
                    <span>{getPlatformDisplay(editingLink).name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editingLink.username}
                    onChange={(e) =>
                      setEditingLink({
                        ...editingLink,
                        username: e.target.value,
                      })
                    }
                    maxLength={50}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button
                onClick={updateSocialLink}
                disabled={saving}
                className="w-full order-1"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="w-full order-2"
              >
                Batal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
