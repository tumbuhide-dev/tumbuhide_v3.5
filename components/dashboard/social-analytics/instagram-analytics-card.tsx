"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ExternalLink,
  Heart,
  MessageCircle,
  Instagram,
  TrendingUp,
  Calendar,
  MapPin,
  Globe,
  Verified,
  Loader2,
  Save,
  AlertTriangle,
  Lock,
  Trash2,
  Eye,
  FolderSyncIcon as Sync,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  formatNumber,
  formatEngagementRate,
  getEngagementRateLabel,
  formatTimestamp,
  daysSinceLastPost,
  getPostTypeLabel,
  type InstagramAnalytics,
} from "@/lib/trendhero-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InstagramAnalyticsCardProps {
  userId: string;
}

export function InstagramAnalyticsCard({
  userId,
}: InstagramAnalyticsCardProps) {
  const [username, setUsername] = useState("");
  const [analytics, setAnalytics] = useState<InstagramAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dailyUsageCount, setDailyUsageCount] = useState(0);
  const [hasCheckedDatabase, setHasCheckedDatabase] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    checkSavedUsername();
    checkDailyUsage();
  }, []);

  const checkDailyUsage = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("analytics_usage")
        .select("count")
        .eq("user_id", userId)
        .eq("platform", "instagram")
        .eq("date", today)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking daily usage:", error);
        return;
      }

      setDailyUsageCount(data?.count || 0);
    } catch (error) {
      console.error("Error checking daily usage:", error);
    }
  };

  const incrementDailyUsage = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("analytics_usage")
        .select("count")
        .eq("user_id", userId)
        .eq("platform", "instagram")
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("analytics_usage")
          .update({ count: existing.count + 1 })
          .eq("user_id", userId)
          .eq("platform", "instagram")
          .eq("date", today);
      } else {
        await supabase.from("analytics_usage").insert({
          user_id: userId,
          platform: "instagram",
          date: today,
          count: 1,
        });
      }

      setDailyUsageCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error incrementing daily usage:", error);
    }
  };

  // Check if user has saved username (NO LIMIT)
  const checkSavedUsername = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("instagram_analytics")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking database:", error);
        setError("Gagal mengecek database");
        setLoading(false);
        return;
      }

      if (data?.saved_username) {
        setSavedUsername(data.saved_username);
        setUsername(data.saved_username);

        // Load analytics data from database
        const analyticsData = {
          userInfo: {
            id: data.instagram_id,
            username: data.username || data.saved_username,
            full_name: data.full_name || "Tidak ada Data",
            profile_pic_url: data.profile_pic_url || "/placeholder.svg",
            biography: data.biography || "Tidak ada Data",
            external_url: data.external_url || null,
            follower_count: data.follower_count || 0,
            following_count: data.following_count || 0,
            media_count: data.media_count || 0,
            er: data.engagement_rate || 0,
            is_private: data.is_private || false,
            is_verified: data.is_verified || false,
            is_business_account: data.is_business_account || false,
            country: data.country || "Tidak ada Data",
            city: data.city || null,
            languages: data.languages || [],
            topics: data.topics || { detected: null, user_defined: [] },
            cached_timestamp: data.cached_timestamp,
            last_post_at: data.last_post_at || 0,
          },
          posts: data.recent_posts || [],
          engagementRate: data.engagement_rate || 0,
          avgLikes: 0,
          avgComments: 0,
          totalEngagement: 0,
          lastUpdated: new Date(data.last_updated),
        };

        // Calculate averages from posts
        const posts = analyticsData.posts;
        if (posts && posts.length > 0) {
          const totalLikes = posts.reduce(
            (sum: number, post: any) => sum + (post.likes || 0),
            0
          );
          const totalComments = posts.reduce(
            (sum: number, post: any) => sum + (post.comments || 0),
            0
          );
          analyticsData.avgLikes = Math.round(totalLikes / posts.length);
          analyticsData.avgComments = Math.round(totalComments / posts.length);
          analyticsData.totalEngagement = totalLikes + totalComments;
        }

        setAnalytics(analyticsData);
      }

      setHasCheckedDatabase(true);
    } catch (error) {
      console.error("Error checking database:", error);
      setError("Terjadi kesalahan saat mengecek database");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsername = async () => {
    setShowDeleteDialog(false);
    setLoading(true);

    try {
      await supabase.from("instagram_analytics").delete().eq("user_id", userId);

      setSavedUsername(null);
      setAnalytics(null);
      setUsername("");
      setHasCheckedDatabase(false);
    } catch (error) {
      setError("Gagal menghapus username");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      setError("Username wajib diisi");
      return;
    }

    if (dailyUsageCount >= 3) {
      setError(
        "Anda telah mencapai batas maksimal 3x untuk hari ini. Silakan coba lagi besok."
      );
      return;
    }

    setShowConfirmDialog(false);
    setLoading(true);
    setError("");

    try {
      const cleanUsername = username.replace("@", "").trim();

      const response = await fetch("/api/instagram-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if account is private
        if (data.analytics.userInfo.is_private) {
          setError(
            "Akun Instagram ini bersifat private. Mohon ubah akun menjadi public untuk mendapatkan analytics lengkap."
          );
          setLoading(false);
          return;
        }

        // Update saved_username in database
        await supabase
          .from("instagram_analytics")
          .update({ saved_username: cleanUsername })
          .eq("user_id", userId);

        await incrementDailyUsage();
        setAnalytics(data.analytics);
        setSavedUsername(cleanUsername);
        setHasCheckedDatabase(true);
      } else {
        if (data.error?.includes("private")) {
          setError(
            "Akun Instagram ini bersifat private. Mohon ubah akun menjadi public untuk mendapatkan analytics lengkap."
          );
        } else if (data.error?.includes("not found")) {
          setError(
            "Akun Instagram tidak ditemukan. Mohon periksa kembali username yang Anda masukkan."
          );
        } else {
          setError(data.error || "Gagal mengambil data analytics");
        }
      }
    } catch (error) {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    if (!savedUsername) return;

    if (dailyUsageCount >= 3) {
      setError(
        "Anda telah mencapai batas maksimal 3x untuk hari ini. Silakan coba lagi besok."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/instagram-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: savedUsername,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await incrementDailyUsage();
        setAnalytics(data.analytics);
      } else {
        setError(data.error || "Gagal memperbarui data");
      }
    } catch (error) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  // If no saved username, show input form
  if (!savedUsername && hasCheckedDatabase) {
    return (
      <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-950 dark:to-yellow-950 dark:border-purple-700">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-yellow-100 dark:from-purple-900 dark:to-yellow-900 border-b border-purple-200 dark:border-purple-700">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Instagram className="w-5 h-5" />
            Instagram Analytics
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Masukkan username Instagram untuk mendapatkan analytics mendalam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <Alert className="border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 dark:border-yellow-700">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Perhatian:</strong> Pastikan username yang Anda masukkan
              benar dan akun bersifat <strong>PUBLIC</strong>. Periksa kembali
              sebelum menyimpan karena kesalahan input akan mempengaruhi hasil
              analytics.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label
              htmlFor="instagram-username"
              className="text-gray-700 dark:text-gray-300 font-medium"
            >
              Username Instagram
            </Label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  @
                </span>
                <Input
                  id="instagram-username"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-8 border-purple-300 focus:border-purple-500 focus:ring-purple-500 dark:border-purple-600 dark:focus:border-purple-400"
                  onKeyPress={(e) =>
                    e.key === "Enter" && setShowConfirmDialog(true)
                  }
                />
              </div>
              <Dialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={
                      loading || !username.trim() || dailyUsageCount >= 3
                    }
                    className="bg-gradient-to-r from-purple-500 to-yellow-500 text-white hover:from-purple-600 hover:to-yellow-600 w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Simpan Username
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 max-w-md border-purple-200 dark:border-purple-700">
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-purple-900 dark:text-purple-100">
                      Konfirmasi Simpan Username
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                      Apakah Anda yakin ingin menyimpan username{" "}
                      <strong>@{username}</strong>? Pastikan username sudah
                      benar karena akan mempengaruhi hasil analytics.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col gap-2 sm:flex-col">
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-yellow-500 text-white hover:from-purple-600 hover:to-yellow-600 w-full order-1"
                      onClick={handleSaveUsername}
                    >
                      Ya, Simpan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDialog(false)}
                      className="w-full order-2"
                    >
                      Batal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {dailyUsageCount >= 3 && (
              <Alert
                variant="destructive"
                className="border-red-300 dark:border-red-700"
              >
                <AlertDescription>
                  Anda telah mencapai batas maksimal 3x untuk hari ini. Silakan
                  coba lagi besok.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="bg-red-50 border border-red-300 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-200"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-2 border-purple-200 shadow-lg dark:border-purple-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-gray-700 dark:text-gray-300">
              Memuat Instagram analytics...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const userInfo = analytics.userInfo;
  const posts = analytics.posts || [];
  const daysSince = userInfo.last_post_at
    ? daysSinceLastPost(userInfo.last_post_at)
    : 0;

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      {/* Account Info Header */}
      <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-950 dark:to-yellow-950 dark:border-purple-700">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10 flex-shrink-0 border-2 border-purple-300 dark:border-purple-600">
                <AvatarImage
                  src={userInfo.profile_pic_url || "/placeholder.svg"}
                  alt={userInfo.full_name}
                />
                <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300">
                  {userInfo.full_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium flex items-center gap-2 flex-wrap text-gray-900 dark:text-gray-100">
                  <span className="truncate">
                    {userInfo.full_name || "Tidak ada Data"}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-xs flex-shrink-0 bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-800 dark:text-purple-300 dark:border-purple-600"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Tersimpan
                  </Badge>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  @{userInfo.username}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setAnalytics(analytics)}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none border-purple-300 hover:bg-purple-50 hover:border-purple-400 dark:border-purple-600 dark:hover:bg-purple-900"
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Lihat</span>
              </Button>
              <Button
                onClick={refreshAnalytics}
                variant="outline"
                size="sm"
                disabled={loading || dailyUsageCount >= 3}
                className="flex-1 sm:flex-none border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400 dark:border-yellow-600 dark:hover:bg-yellow-900"
              >
                <Sync
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 hover:bg-red-50 hover:border-red-400 text-red-600 dark:border-red-600 dark:hover:bg-red-900 dark:text-red-400 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Hapus</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 max-w-md">
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-red-900 dark:text-red-100">
                      Konfirmasi Hapus Username
                    </DialogTitle>
                    <DialogDescription>
                      Apakah Anda yakin ingin menghapus username{" "}
                      <strong>@{userInfo.username}</strong>? Anda dapat
                      menambahkan username baru setelah menghapus yang ini.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col gap-2 sm:flex-col">
                    <Button
                      onClick={handleDeleteUsername}
                      variant="destructive"
                      className="w-full order-1"
                    >
                      Ya, Hapus
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      className="w-full order-2"
                    >
                      Batal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Limit Warning */}
      {dailyUsageCount >= 3 && (
        <Alert className="border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 dark:border-yellow-700">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Batas Harian Tercapai:</strong> Anda telah menggunakan 3x
            refresh analytics hari ini. Fitur refresh akan tersedia kembali
            besok.
          </AlertDescription>
        </Alert>
      )}

      {/* Show private account warning if needed */}
      {userInfo.is_private && (
        <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 dark:border-purple-700">
          <Lock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          <AlertDescription className="text-purple-800 dark:text-purple-200">
            <strong>Akun Private Terdeteksi:</strong> Akun Instagram ini
            bersifat private. Untuk mendapatkan analytics lengkap, mohon ubah
            akun menjadi public di pengaturan Instagram Anda.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Overview */}
      <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-950 dark:to-yellow-950 dark:border-purple-700">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-yellow-100 dark:from-purple-900 dark:to-yellow-900 border-b border-purple-200 dark:border-purple-700">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Instagram className="w-5 h-5" />
            Analytics Akun: @{userInfo.username}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-purple-300 dark:border-purple-600 shadow-lg">
              <AvatarImage
                src={userInfo.profile_pic_url || "/placeholder.svg"}
                alt={userInfo.full_name}
              />
              <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300">
                {userInfo.full_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-1">
                <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-gray-100">
                  {userInfo.full_name || "Tidak ada Data"}
                </h3>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  {userInfo.is_verified && (
                    <Verified className="w-4 h-4 text-blue-500" />
                  )}
                  {userInfo.is_business_account && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-600"
                    >
                      Business
                    </Badge>
                  )}
                  {userInfo.is_private && (
                    <Badge
                      variant="outline"
                      className="text-xs border-red-300 text-red-600 dark:border-red-600 dark:text-red-400"
                    >
                      Private
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 truncate">
                @{userInfo.username}
              </p>
              {userInfo.biography &&
                userInfo.biography !== "Tidak ada Data" && (
                  <p className="text-sm mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    {userInfo.biography}
                  </p>
                )}
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                {userInfo.country && userInfo.country !== "Tidak ada Data" && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {userInfo.city &&
                        userInfo.city !== "Tidak ada Data" &&
                        `${userInfo.city}, `}
                      {userInfo.country}
                    </span>
                  </div>
                )}
                {userInfo.external_url && (
                  <a
                    href={userInfo.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-br from-purple-500 to-yellow-500 shadow-md rounded-lg py-2 px-4 inline-block">
                {formatNumber(userInfo.follower_count)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Followers
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-br from-purple-500 to-yellow-500 shadow-md rounded-lg py-2 px-4 inline-block">
                {formatNumber(userInfo.following_count)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Following
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-br from-purple-500 to-yellow-500 shadow-md rounded-lg py-2 px-4 inline-block">
                {formatNumber(userInfo.media_count)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Posts
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-br from-purple-500 to-yellow-500 shadow-md rounded-lg py-2 px-4 inline-block">
                {formatEngagementRate(analytics.engagementRate)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Engagement Rate
              </div>
            </div>
          </div>

          {/* Engagement Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-purple-200 dark:border-purple-700">
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatNumber(analytics.avgLikes)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Avg Likes
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 dark:border-purple-700">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatNumber(analytics.avgComments)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Avg Comments
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 dark:border-purple-700">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getEngagementRateLabel(analytics.engagementRate)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ER Quality
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Status */}
          {userInfo.last_post_at && userInfo.last_post_at > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Last Post:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatTimestamp(userInfo.last_post_at)}
                </span>
              </div>
              <Badge
                variant={
                  daysSince <= 7
                    ? "default"
                    : daysSince <= 30
                    ? "secondary"
                    : "destructive"
                }
              >
                {daysSince === 0 ? "Today" : `${daysSince} days ago`}
              </Badge>
            </div>
          )}

          {/* Languages & Topics */}
          {(userInfo.languages?.length > 0 ||
            userInfo.topics?.user_defined?.length > 0) && (
            <div className="space-y-3">
              {userInfo.languages?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {userInfo.languages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="outline"
                        className="text-xs border-purple-300 dark:border-purple-600"
                      >
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {userInfo.topics?.user_defined?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Topics
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {userInfo.topics.user_defined.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-600"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            Terakhir diperbarui:{" "}
            {analytics.lastUpdated
              ? new Date(analytics.lastUpdated).toLocaleString("id-ID")
              : "Tidak diketahui"}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      {posts.length > 0 ? (
        <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-950 dark:to-yellow-950 dark:border-purple-700">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-yellow-100 dark:from-purple-900 dark:to-yellow-900 border-b border-purple-200 dark:border-purple-700">
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Recent Posts
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Latest {posts.length} posts with engagement data
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.slice(0, 6).map((post) => (
                <Card
                  key={post.pk}
                  className="overflow-hidden border-purple-200 dark:border-purple-700"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="text-xs border-purple-300 dark:border-purple-600"
                        >
                          {getPostTypeLabel(post.type)}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(post.taken_at)}
                        </span>
                      </div>

                      {post.caption && (
                        <p className="text-sm line-clamp-3 text-gray-700 dark:text-gray-300">
                          {post.caption.substring(0, 100)}...
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatNumber(post.likes)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-blue-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatNumber(post.comments)}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`https://instagram.com/p/${post.shortcode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-950 dark:to-yellow-950 dark:border-purple-700">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-yellow-100 dark:from-purple-900 dark:to-yellow-900 border-b border-purple-200 dark:border-purple-700">
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <div className="py-8">
              <Instagram className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Tidak Ada Postingan
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Akun ini belum memiliki postingan atau postingan tidak dapat
                diakses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
