"use client";
import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trash2,
  Plus,
  ExternalLink,
  ArrowLeft,
  Crown,
  BarChart3,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SECURITY } from "@/lib/constants";
import { validateURL, sanitizeInput } from "@/lib/security";
import { InstagramAnalyticsCard } from "./instagram-analytics-card";
import { TikTokAnalyticsCard } from "./tiktok-analytics-card";
import { getPlatformIcon, getPlatformColor } from "@/lib/platform-icons";
import Link from "next/link";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface SocialLink {
  id: string;
  platform: string;
  username: string;
  url: string;
  followers_count: number;
  following_count: number;
  media_count: number;
  engagement_rate: number;
  is_verified: boolean;
  display_order: number;
  updated_at: string;
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
    supportsAnalytics: true,
    icon: "📷",
    color: "#E4405F",
  },
  {
    value: "tiktok",
    label: "TikTok",
    placeholder: "@username",
    urlTemplate: "https://tiktok.com/@{username}",
    supportsAnalytics: true,
    icon: "🎵",
    color: "#000000",
  },
  {
    value: "youtube",
    label: "YouTube",
    placeholder: "@channel",
    urlTemplate: "https://youtube.com/@{username}",
    supportsAnalytics: false,
    icon: "📺",
    color: "#FF0000",
  },
  {
    value: "twitter",
    label: "Twitter/X",
    placeholder: "@username",
    urlTemplate: "https://twitter.com/{username}",
    supportsAnalytics: false,
    icon: "🐦",
    color: "#1DA1F2",
  },
  {
    value: "facebook",
    label: "Facebook",
    placeholder: "username",
    urlTemplate: "https://facebook.com/{username}",
    supportsAnalytics: false,
    icon: "📘",
    color: "#1877F2",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    placeholder: "username",
    urlTemplate: "https://linkedin.com/in/{username}",
    supportsAnalytics: false,
    icon: "💼",
    color: "#0077B5",
  },
  {
    value: "github",
    label: "GitHub",
    placeholder: "@username",
    urlTemplate: "https://github.com/{username}",
    supportsAnalytics: false,
    icon: "💻",
    color: "#333333",
  },
  {
    value: "twitch",
    label: "Twitch",
    placeholder: "@username",
    urlTemplate: "https://twitch.tv/{username}",
    supportsAnalytics: false,
    icon: "🎮",
    color: "#9146FF",
  },
  {
    value: "spotify",
    label: "Spotify",
    placeholder: "artist-name",
    urlTemplate: "https://open.spotify.com/artist/{username}",
    supportsAnalytics: false,
    icon: "🎧",
    color: "#1DB954",
  },
  {
    value: "website",
    label: "Website",
    placeholder: "website.com",
    urlTemplate: "https://{username}",
    supportsAnalytics: false,
    icon: "🌐",
    color: "#6B7280",
  },
];

export function SocialLinksManager({
  userId,
  userPlan,
}: SocialLinksManagerProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("links");
  const [newLink, setNewLink] = useState({
    platform: "",
    username: "",
  });

  const supabase = createClientComponentClient();
  const maxLinks =
    userPlan === "pro"
      ? SECURITY.CONTENT_LIMITS.MAX_SOCIAL_LINKS_PRO
      : SECURITY.CONTENT_LIMITS.MAX_SOCIAL_LINKS_BASIC;

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", userId)
        .order("display_order");

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateURL = (platform: string, username: string): string => {
    const platformConfig = SOCIAL_PLATFORMS.find((p) => p.value === platform);
    if (!platformConfig) return "";

    const cleanUsername = username.replace("@", "").replace(/^https?:\/\//, "");

    if (platform === "website") {
      return cleanUsername.startsWith("http")
        ? cleanUsername
        : `https://${cleanUsername}`;
    }

    return platformConfig.urlTemplate.replace("{username}", cleanUsername);
  };

  const addSocialLink = async () => {
    if (!newLink.platform) {
      setError("Platform wajib dipilih");
      return;
    }

    if (!newLink.username) {
      setError("Username wajib diisi");
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

    // Check if platform already exists
    if (socialLinks.some((link) => link.platform === newLink.platform)) {
      setError("Platform ini sudah ditambahkan");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const generatedURL = generateURL(newLink.platform, newLink.username);

      if (!validateURL(generatedURL)) {
        setError("URL yang dihasilkan tidak valid");
        return;
      }

      const { data, error } = await supabase
        .from("social_links")
        .insert({
          user_id: userId,
          platform: newLink.platform,
          username: sanitizeInput(newLink.username.replace("@", "")),
          url: generatedURL,
          followers_count: 0,
          display_order: socialLinks.length,
        })
        .select()
        .single();

      if (error) throw error;

      setSocialLinks([...socialLinks, data]);
      setNewLink({ platform: "", username: "" });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateFollowerCount = async (linkId: string, count: number) => {
    try {
      const { error } = await supabase
        .from("social_links")
        .update({ followers_count: count })
        .eq("id", linkId);

      if (error) throw error;

      setSocialLinks((links) =>
        links.map((link) =>
          link.id === linkId ? { ...link, followers_count: count } : link
        )
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteSocialLink = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("social_links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSocialLinks(socialLinks.filter((link) => link.id !== id));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getPlatformDisplay = (link: SocialLink) => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.value === link.platform);
    const IconComponent = getPlatformIcon(link.platform);

    return {
      name: platform?.label || link.platform,
      IconComponent,
      color: platform?.color || getPlatformColor(link.platform),
      supportsAnalytics: platform?.supportsAnalytics || false,
    };
  };

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  const instagramLink = socialLinks.find(
    (link) => link.platform === "instagram"
  );
  const tiktokLink = socialLinks.find((link) => link.platform === "tiktok");

  if (loading) {
    return (
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
    );
  }

  const selectedPlatform = SOCIAL_PLATFORMS.find(
    (p) => p.value === newLink.platform
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="links">Social Links</TabsTrigger>
          <TabsTrigger value="instagram" disabled={!instagramLink}>
            Instagram Analytics {!instagramLink && "(Add Instagram first)"}
          </TabsTrigger>
          <TabsTrigger value="tiktok" disabled={!tiktokLink}>
            TikTok Analytics {!tiktokLink && "(Add TikTok first)"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-6">
          {/* Plan Limit Info */}
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Paket {userPlan === "pro" ? "Pro" : "Basic"}:{" "}
                  {socialLinks.length}/{maxLinks === -1 ? "∞" : maxLinks} social
                  links
                </span>
                {userPlan === "basic" && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/plan-selection">Upgrade ke Pro</Link>
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Analytics Info */}
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">📊 Analytics Available:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="bg-pink-500">
                    📷 Instagram - Full Analytics
                  </Badge>
                  <Badge variant="default" className="bg-black text-white">
                    🎵 TikTok - Full Analytics
                  </Badge>
                  <Badge variant="secondary">🎬 YouTube - Manual Input</Badge>
                  <Badge variant="secondary">🐦 Twitter - Manual Input</Badge>
                  <Badge variant="secondary">📘 Facebook - Manual Input</Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Instagram menggunakan TrendHero API. TikTok menggunakan
                  FastMoss API. Platform lain manual input.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Add New Link */}
          <Card>
            <CardHeader>
              <CardTitle>Tambah Social Link Baru</CardTitle>
              <CardDescription>
                Pilih platform dan masukkan username Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center gap-2">
                            <span>{platform.icon}</span>
                            <span>{platform.label}</span>
                            {platform.supportsAnalytics && (
                              <Badge variant="secondary" className="text-xs">
                                Analytics
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
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
                  />
                  {selectedPlatform && newLink.username && (
                    <p className="text-xs text-gray-500">
                      URL: {generateURL(newLink.platform, newLink.username)}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={addSocialLink}
                disabled={
                  saving ||
                  !newLink.platform ||
                  !newLink.username ||
                  (maxLinks !== -1 && socialLinks.length >= maxLinks)
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Social Link
              </Button>
            </CardContent>
          </Card>

          {/* Existing Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Social Links Anda ({socialLinks.length})
            </h3>

            {socialLinks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">
                    Belum ada social links. Tambahkan yang pertama!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {socialLinks.map((link) => {
                  const platformDisplay = getPlatformDisplay(link);
                  const IconComponent = platformDisplay.IconComponent;

                  return (
                    <Card key={link.id}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                style={{
                                  backgroundColor: platformDisplay.color,
                                }}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {platformDisplay.name}
                                  </Badge>
                                  {platformDisplay.supportsAnalytics && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      Analytics
                                    </Badge>
                                  )}
                                  {link.is_verified && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-blue-500"
                                    >
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <div className="font-medium">
                                    @{link.username}
                                  </div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                    {link.url}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {platformDisplay.supportsAnalytics && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setActiveTab(link.platform)}
                                >
                                  <BarChart3 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                              <ConfirmationDialog
                                title="Hapus Social Link"
                                description={`Apakah Anda yakin ingin menghapus ${platformDisplay.name} (@${link.username})? Tindakan ini tidak dapat dibatalkan.`}
                                onConfirm={() => deleteSocialLink(link.id)}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={saving}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </ConfirmationDialog>
                            </div>
                          </div>

                          {/* Stats Section */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs">Followers</Label>
                              {platformDisplay.supportsAnalytics ? (
                                <div className="h-8 flex items-center text-sm font-medium bg-gray-50 px-3 rounded border">
                                  {formatFollowerCount(link.followers_count)}
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
                                    Auto
                                  </Badge>
                                </div>
                              ) : (
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={link.followers_count || ""}
                                  onChange={(e) =>
                                    updateFollowerCount(
                                      link.id,
                                      Number.parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="h-8"
                                />
                              )}
                            </div>

                            {link.following_count > 0 && (
                              <div className="space-y-1">
                                <Label className="text-xs">Following</Label>
                                <div className="h-8 flex items-center text-sm font-medium bg-gray-50 px-3 rounded border">
                                  {formatFollowerCount(link.following_count)}
                                </div>
                              </div>
                            )}

                            {link.media_count > 0 && (
                              <div className="space-y-1">
                                <Label className="text-xs">Posts</Label>
                                <div className="h-8 flex items-center text-sm font-medium bg-gray-50 px-3 rounded border">
                                  {formatFollowerCount(link.media_count)}
                                </div>
                              </div>
                            )}

                            {link.engagement_rate > 0 && (
                              <div className="space-y-1">
                                <Label className="text-xs">Engagement</Label>
                                <div className="h-8 flex items-center text-sm font-medium bg-gray-50 px-3 rounded border">
                                  {(link.engagement_rate * 100).toFixed(2)}%
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Display Stats */}
                          {link.followers_count > 0 && (
                            <div className="text-sm text-gray-600">
                              <div className="font-medium">
                                {formatFollowerCount(link.followers_count)}{" "}
                                followers
                              </div>
                              <div className="text-xs text-gray-500">
                                Updated:{" "}
                                {new Date(link.updated_at).toLocaleString(
                                  "id-ID",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="instagram" className="space-y-6">
          {instagramLink ? (
            <InstagramAnalyticsCard
              username={instagramLink.username}
              socialLinkId={instagramLink.id}
              onAnalyticsUpdate={(analytics) => {
                // Update social link with analytics data
                setSocialLinks((links) =>
                  links.map((link) =>
                    link.id === instagramLink.id
                      ? {
                          ...link,
                          followers_count: analytics.userInfo.follower_count,
                          following_count: analytics.userInfo.following_count,
                          media_count: analytics.userInfo.media_count,
                          engagement_rate: analytics.engagementRate,
                          is_verified: analytics.userInfo.is_verified,
                        }
                      : link
                  )
                );
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Instagram Analytics
                </h3>
                <p className="text-gray-600 mb-4">
                  Tambahkan akun Instagram terlebih dahulu untuk melihat
                  analytics
                </p>
                <Button onClick={() => setActiveTab("links")}>
                  Tambah Instagram
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tiktok" className="space-y-6">
          {tiktokLink ? (
            <TikTokAnalyticsCard
              username={tiktokLink.username}
              socialLinkId={tiktokLink.id}
              onAnalyticsUpdate={(analytics) => {
                // Update social link with analytics data
                setSocialLinks((links) =>
                  links.map((link) =>
                    link.id === tiktokLink.id
                      ? {
                          ...link,
                          followers_count: analytics.userInfo.follower_count,
                          following_count: 0, // TikTok doesn't provide following count
                          media_count: analytics.analytics.aweme_28_count,
                          engagement_rate: analytics.analytics.flow_index / 100,
                          is_verified: analytics.userInfo.verify_type === "1",
                        }
                      : link
                  )
                );
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">TikTok Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Tambahkan akun TikTok terlebih dahulu untuk melihat analytics
                </p>
                <Button onClick={() => setActiveTab("links")}>
                  Tambah TikTok
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
