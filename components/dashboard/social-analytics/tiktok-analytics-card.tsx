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
  MapPin,
  Verified,
  Loader2,
  Music,
  Save,
  AlertTriangle,
  Lock,
  Crown,
  BarChart3,
  CheckCircle,
  TrendingUp,
  Users,
  Play,
  Trash2,
  Eye,
  FolderSyncIcon as Sync,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface TikTokAnalyticsCardProps {
  userId: string;
}

interface AnalysisStep {
  step: number;
  title: string;
  description: string;
  status: "pending" | "loading" | "completed" | "error";
}

export function TikTokAnalyticsCard({ userId }: TikTokAnalyticsCardProps) {
  const [username, setUsername] = useState("");
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dailyUsageCount, setDailyUsageCount] = useState(0);
  const [hasCheckedDatabase, setHasCheckedDatabase] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      step: 1,
      title: "Mencari Akun TikTok",
      description: "Memverifikasi username dan mendapatkan UID",
      status: "pending",
    },
    {
      step: 2,
      title: "Menganalisis Profile",
      description: "Mengumpulkan data profile dan informasi akun",
      status: "pending",
    },
    {
      step: 3,
      title: "Menghitung Metrics",
      description: "Menganalisis performa dan engagement metrics",
      status: "pending",
    },
    {
      step: 4,
      title: "Menyimpan Data",
      description: "Menyimpan analytics ke database",
      status: "pending",
    },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

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
        .eq("platform", "tiktok")
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
        .eq("platform", "tiktok")
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("analytics_usage")
          .update({ count: existing.count + 1 })
          .eq("user_id", userId)
          .eq("platform", "tiktok")
          .eq("date", today);
      } else {
        await supabase.from("analytics_usage").insert({
          user_id: userId,
          platform: "tiktok",
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
        .from("tiktok_analytics")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking database:", error);
        setError("Gagal mengecek database");
        setLoading(false);
        return;
      }

      if (data?.saved_username && data?.tiktok_uid) {
        setSavedUsername(data.saved_username);
        setUsername(data.saved_username);

        // Load analytics data from database
        const analyticsData = {
          basicInfo: {
            uid: data.tiktok_uid,
            unique_id: data.unique_id || data.saved_username,
            nickname: data.nickname || "Tidak ada Data",
            avatar: data.avatar || "/placeholder.svg",
            follower_count: data.follower_count_basic || 0,
            region_name: data.region_name_basic || "Tidak ada Data",
          },
          baseInfo: {
            uid: data.tiktok_uid,
            unique_id: data.unique_id,
            nickname: data.nickname,
            signature: data.signature || "Tidak ada Data",
            avatar: data.avatar,
            region: data.region,
            verify_type: data.verify_type,
            account_type: data.account_type,
            category_name: data.category_name || "Tidak ada Data",
            region_name: data.region_name_basic || data.region_name,
            first_video_time: data.first_video_time || "Tidak ada Data",
          },
          authorIndex: {
            follower_count:
              data.follower_count || data.follower_count_basic || 0,
            follower_count_show:
              data.follower_count_show ||
              formatTikTokNumber(data.follower_count_basic),
            region_rank: data.region_rank || null,
            region_rank_show: data.region_rank_show || "Tidak ada Data",
            category_rank: data.category_rank || null,
            category_rank_show: data.category_rank_show || "Tidak ada Data",
            video_28_avg_play_count: data.video_28_avg_play_count || null,
            video_28_avg_play_count_show:
              data.video_28_avg_play_count_show || "Tidak ada Data",
            video_28_avg_interaction_count:
              data.video_28_avg_interaction_count || null,
            video_28_avg_interaction_count_show:
              data.video_28_avg_interaction_count_show || "Tidak ada Data",
            aweme_28_count: data.aweme_28_count || null,
            aweme_28_count_show: data.aweme_28_count_show || "Tidak ada Data",
            flow_index: data.flow_index || null,
            carry_index: data.carry_index || null,
          },
          lastUpdated: new Date(data.last_updated),
        };

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
      await supabase.from("tiktok_analytics").delete().eq("user_id", userId);

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

  const updateStepStatus = (
    stepIndex: number,
    status: "pending" | "loading" | "completed" | "error"
  ) => {
    setAnalysisSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status } : step
      )
    );
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
    setCurrentStep(0);

    // Reset all steps
    setAnalysisSteps((prev) =>
      prev.map((step) => ({ ...step, status: "pending" }))
    );

    try {
      const cleanUsername = username.replace("@", "").trim();

      // Step 1: Find UID and basic info (WAJIB)
      setCurrentStep(1);
      updateStepStatus(0, "loading");

      const findUrl = `https://www.fastmoss.com/api/data/find?type=1&content=${encodeURIComponent(
        cleanUsername
      )}`;
      const findResponse = await fetch(findUrl);
      const findData = await findResponse.json();

      if (
        findData.code !== 200 ||
        !findData.data?.is_ok ||
        findData.data.is_ok === 0
      ) {
        updateStepStatus(0, "error");
        setError(
          "Akun TikTok tidak ditemukan. Mohon periksa kembali username yang Anda masukkan."
        );
        setLoading(false);
        return;
      }

      if (!findData.data?.info?.uid) {
        updateStepStatus(0, "error");
        setError("UID tidak ditemukan dalam response API");
        setLoading(false);
        return;
      }

      const basicInfo = findData.data.info;
      updateStepStatus(0, "completed");

      // Step 2: Get extended profile info (optional)
      setCurrentStep(2);
      updateStepStatus(1, "loading");

      const baseInfoResponse = await fetch(
        `https://www.fastmoss.com/api/author/v3/detail/baseInfo?uid=${basicInfo.uid}`
      );
      const baseInfoData = await baseInfoResponse.json();
      const extendedInfo = baseInfoData.data || {};

      updateStepStatus(1, "completed");

      // Step 3: Get analytics metrics (optional)
      setCurrentStep(3);
      updateStepStatus(2, "loading");

      const authorIndexResponse = await fetch(
        `https://www.fastmoss.com/api/author/v3/detail/authorIndex?uid=${basicInfo.uid}`
      );
      const authorIndexData = await authorIndexResponse.json();
      const metricsInfo = authorIndexData.data || {};

      updateStepStatus(2, "completed");

      // Step 4: Save to database
      setCurrentStep(4);
      updateStepStatus(3, "loading");

      const { error: saveError } = await supabase
        .from("tiktok_analytics")
        .upsert({
          user_id: userId,
          saved_username: cleanUsername,

          // Basic Info dari Step 1 (WAJIB)
          tiktok_uid: basicInfo.uid,
          unique_id: basicInfo.unique_id || cleanUsername,
          nickname: basicInfo.nickname || "Tidak ada Data",
          avatar: basicInfo.avatar || "/placeholder.svg",
          follower_count_basic: basicInfo.follower_count || 0,
          region_basic: basicInfo.region || null,
          region_name_basic: basicInfo.region_name || "Tidak ada Data",

          // Extended Info dari Step 2 (optional)
          signature: extendedInfo.signature || null,
          region: extendedInfo.region || basicInfo.region,
          verify_type: extendedInfo.verify_type || "0",
          account_type: extendedInfo.account_type || "0",
          category_name: extendedInfo.category_name || null,
          category_id: extendedInfo.category_id || null,
          first_video_time: extendedInfo.first_video_time || null,
          show_shop_tab: extendedInfo.show_shop_tab || 0,
          is_shop_author: extendedInfo.is_shop_author || 0,
          live_type: extendedInfo.live_type || 0,

          // Metrics dari Step 3 (optional)
          follower_count:
            metricsInfo.follower_count || basicInfo.follower_count || 0,
          follower_count_show:
            metricsInfo.follower_count_show ||
            basicInfo.follower_count_show ||
            null,
          follower_28_count: metricsInfo.follower_28_count || null,
          follower_28_count_show: metricsInfo.follower_28_count_show || null,
          region_rank: metricsInfo.region_rank || null,
          region_rank_show: metricsInfo.region_rank_show || null,
          category_rank: metricsInfo.category_rank || null,
          category_rank_show: metricsInfo.category_rank_show || null,
          flow_index: metricsInfo.flow_index || null,
          carry_index: metricsInfo.carry_index || null,
          aweme_28_count: metricsInfo.aweme_28_count || null,
          aweme_28_count_show: metricsInfo.aweme_28_count_show || null,
          video_28_avg_play_count: metricsInfo.video_28_avg_play_count || null,
          video_28_avg_play_count_show:
            metricsInfo.video_28_avg_play_count_show || null,
          video_28_avg_interaction_count:
            metricsInfo.video_28_avg_interaction_count || null,
          video_28_avg_interaction_count_show:
            metricsInfo.video_28_avg_interaction_count_show || null,

          analysis_step: 3,
          analysis_status: "completed",
          last_updated: new Date().toISOString(),
        });

      if (saveError) {
        updateStepStatus(3, "error");
        setError("Gagal menyimpan data ke database");
        setLoading(false);
        return;
      }

      updateStepStatus(3, "completed");
      await incrementDailyUsage();

      // Set analytics data
      const analyticsData = {
        basicInfo: {
          uid: basicInfo.uid,
          unique_id: basicInfo.unique_id || cleanUsername,
          nickname: basicInfo.nickname || "Tidak ada Data",
          avatar: basicInfo.avatar || "/placeholder.svg",
          follower_count: basicInfo.follower_count || 0,
          region_name: basicInfo.region_name || "Tidak ada Data",
        },
        baseInfo: {
          ...extendedInfo,
          uid: basicInfo.uid,
          unique_id: basicInfo.unique_id || cleanUsername,
          nickname:
            basicInfo.nickname || extendedInfo.nickname || "Tidak ada Data",
          avatar: basicInfo.avatar || extendedInfo.avatar || "/placeholder.svg",
          region_name:
            basicInfo.region_name ||
            extendedInfo.region_name ||
            "Tidak ada Data",
        },
        authorIndex: {
          ...metricsInfo,
          follower_count:
            metricsInfo.follower_count || basicInfo.follower_count || 0,
          follower_count_show:
            metricsInfo.follower_count_show ||
            basicInfo.follower_count_show ||
            formatTikTokNumber(basicInfo.follower_count),
        },
        lastUpdated: new Date(),
      };

      setAnalytics(analyticsData);
      setSavedUsername(cleanUsername);
      setHasCheckedDatabase(true);
    } catch (error) {
      updateStepStatus(currentStep - 1, "error");
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
      // Get fresh data from API
      const findUrl = `https://www.fastmoss.com/api/data/find?type=1&content=${encodeURIComponent(
        savedUsername
      )}`;
      const findResponse = await fetch(findUrl);
      const findData = await findResponse.json();

      if (findData.code !== 200 || !findData.data?.info?.uid) {
        setError("Gagal memperbarui data");
        setLoading(false);
        return;
      }

      const basicInfo = findData.data.info;

      // Get extended info
      const baseInfoResponse = await fetch(
        `https://www.fastmoss.com/api/author/v3/detail/baseInfo?uid=${basicInfo.uid}`
      );
      const baseInfoData = await baseInfoResponse.json();
      const extendedInfo = baseInfoData.data || {};

      // Get metrics
      const authorIndexResponse = await fetch(
        `https://www.fastmoss.com/api/author/v3/detail/authorIndex?uid=${basicInfo.uid}`
      );
      const authorIndexData = await authorIndexResponse.json();
      const metricsInfo = authorIndexData.data || {};

      // Update database
      await supabase
        .from("tiktok_analytics")
        .update({
          // Update basic info
          nickname: basicInfo.nickname || "Tidak ada Data",
          avatar: basicInfo.avatar || "/placeholder.svg",
          follower_count_basic: basicInfo.follower_count || 0,
          region_name_basic: basicInfo.region_name || "Tidak ada Data",

          // Update extended info
          signature: extendedInfo.signature || null,
          category_name: extendedInfo.category_name || null,
          first_video_time: extendedInfo.first_video_time || null,

          // Update metrics
          follower_count:
            metricsInfo.follower_count || basicInfo.follower_count || 0,
          follower_count_show:
            metricsInfo.follower_count_show ||
            basicInfo.follower_count_show ||
            null,
          region_rank: metricsInfo.region_rank || null,
          region_rank_show: metricsInfo.region_rank_show || null,
          category_rank: metricsInfo.category_rank || null,
          category_rank_show: metricsInfo.category_rank_show || null,
          video_28_avg_play_count: metricsInfo.video_28_avg_play_count || null,
          video_28_avg_play_count_show:
            metricsInfo.video_28_avg_play_count_show || null,

          last_updated: new Date().toISOString(),
        })
        .eq("user_id", userId);

      await incrementDailyUsage();

      // Update local state
      const analyticsData = {
        basicInfo: {
          uid: basicInfo.uid,
          unique_id: basicInfo.unique_id || savedUsername,
          nickname: basicInfo.nickname || "Tidak ada Data",
          avatar: basicInfo.avatar || "/placeholder.svg",
          follower_count: basicInfo.follower_count || 0,
          region_name: basicInfo.region_name || "Tidak ada Data",
        },
        baseInfo: {
          ...extendedInfo,
          uid: basicInfo.uid,
          unique_id: basicInfo.unique_id || savedUsername,
          nickname:
            basicInfo.nickname || extendedInfo.nickname || "Tidak ada Data",
          avatar: basicInfo.avatar || extendedInfo.avatar || "/placeholder.svg",
          region_name:
            basicInfo.region_name ||
            extendedInfo.region_name ||
            "Tidak ada Data",
        },
        authorIndex: {
          ...metricsInfo,
          follower_count:
            metricsInfo.follower_count || basicInfo.follower_count || 0,
          follower_count_show:
            metricsInfo.follower_count_show ||
            basicInfo.follower_count_show ||
            formatTikTokNumber(basicInfo.follower_count),
        },
        lastUpdated: new Date(),
      };

      setAnalytics(analyticsData);
    } catch (error) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const formatTikTokNumber = (
    num: number | string | undefined | null
  ): string => {
    if (!num) return "Tidak ada Data";

    const number = typeof num === "string" ? Number.parseInt(num) : num;

    if (typeof number !== "number" || isNaN(number)) {
      return "Tidak ada Data";
    }

    if (number === 0) return "0";

    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
  };

  const getProgressPercentage = () => {
    const completedSteps = analysisSteps.filter(
      (step) => step.status === "completed"
    ).length;
    return (completedSteps / analysisSteps.length) * 100;
  };

  // If no saved username, show input form
  if (!savedUsername && hasCheckedDatabase) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-950 dark:to-yellow-950">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-yellow-100 dark:from-purple-900 dark:to-yellow-900 border-b border-purple-200 dark:border-purple-700">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-yellow-600 rounded-lg">
                <Music className="w-5 h-5 text-white" />
              </div>
              TikTok Analytics
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Masukkan username TikTok untuk mendapatkan analytics mendalam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <Alert className="border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 dark:border-yellow-700">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Perhatian:</strong> Pastikan username yang Anda masukkan
                benar dan akun bersifat <strong>PUBLIC</strong>. Periksa kembali
                sebelum menyimpan karena kesalahan input akan mempengaruhi hasil
                analytics.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label
                htmlFor="tiktok-username"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Username TikTok
              </Label>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    @
                  </span>
                  <Input
                    id="tiktok-username"
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
                      className="bg-gradient-to-r from-purple-600 to-yellow-600 hover:from-purple-700 hover:to-yellow-700 text-white w-full"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Simpan Username
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-purple-200 dark:border-purple-700 mx-4 max-w-md">
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
                        onClick={handleSaveUsername}
                        className="bg-gradient-to-r from-purple-600 to-yellow-600 hover:from-purple-700 hover:to-yellow-700 w-full order-1"
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
                    Anda telah mencapai batas maksimal 3x untuk hari ini.
                    Silakan coba lagi besok.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="border-red-300 dark:border-red-700"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {loading && (
          <Card className="border-2 border-purple-200 shadow-lg dark:border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <Loader2 className="w-5 h-5 animate-spin" />
                Menganalisis Akun TikTok
              </CardTitle>
              <div className="space-y-2">
                <Progress value={getProgressPercentage()} className="h-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Step {currentStep} dari {analysisSteps.length} -{" "}
                  {analysisSteps[currentStep - 1]?.title}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisSteps.map((step, index) => (
                  <div
                    key={step.step}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === "completed"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : step.status === "loading"
                          ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                          : step.status === "error"
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                          : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : step.status === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        step.step
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (loading && !analytics) {
    return (
      <Card className="border-2 border-purple-200 shadow-lg dark:border-purple-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-3 text-purple-600" />
            <span className="text-gray-700 dark:text-gray-300">
              Memuat TikTok analytics...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const basicInfo = analytics.basicInfo || {};
  const baseInfo = analytics.baseInfo || {};
  const authorIndex = analytics.authorIndex || {};

  return (
    <div className="space-y-6 sm:space-y-8 pb-8 max-w-6xl mx-auto">
      {/* Account Info Header */}
      <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-950 dark:to-yellow-950 dark:border-purple-700">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="w-12 h-12 border-2 border-purple-300 dark:border-purple-600 flex-shrink-0">
                <AvatarImage
                  src={basicInfo.avatar || "/placeholder.svg"}
                  alt={basicInfo.nickname}
                />
                <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300">
                  {basicInfo.nickname?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap">
                  <span className="truncate">
                    {basicInfo.nickname || "Tidak ada Data"}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-800 dark:text-purple-300 dark:border-purple-600 flex-shrink-0"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Tersimpan
                  </Badge>
                </h3>
                <p className="text-gray-600 dark:text-gray-400 truncate">
                  @{basicInfo.unique_id || savedUsername}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setAnalytics(analytics)}
                variant="outline"
                size="sm"
                className="border-purple-300 hover:bg-purple-50 hover:border-purple-400 dark:border-purple-600 dark:hover:bg-purple-900 flex-1 sm:flex-none"
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Lihat</span>
              </Button>
              <Button
                onClick={refreshAnalytics}
                variant="outline"
                size="sm"
                disabled={loading || dailyUsageCount >= 3}
                className="border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400 dark:border-yellow-600 dark:hover:bg-yellow-900 flex-1 sm:flex-none"
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
                      <strong>@{basicInfo.unique_id || savedUsername}</strong>?
                      Anda dapat menambahkan username baru setelah menghapus
                      yang ini.
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

      {/* Profile Overview */}
      <Card className="border-2 border-purple-200 shadow-lg overflow-hidden bg-gradient-to-br from-white via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-950 dark:to-yellow-950 dark:border-purple-700">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-yellow-100 dark:from-purple-900 dark:to-yellow-900 border-b border-purple-200 dark:border-purple-700">
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-yellow-600 rounded-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="truncate">
              Analytics: @{basicInfo.unique_id || savedUsername}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-300 dark:border-purple-600 shadow-lg">
              <AvatarImage
                src={basicInfo.avatar || "/placeholder.svg"}
                alt={basicInfo.nickname}
              />
              <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300 text-xl">
                {basicInfo.nickname?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {basicInfo.nickname || "Tidak ada Data"}
                </h3>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  {baseInfo.verify_type === "1" && (
                    <Verified className="w-5 h-5 text-blue-500" />
                  )}
                  {baseInfo.category_name && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-600 text-xs"
                    >
                      {baseInfo.category_name}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-3 truncate">
                @{basicInfo.unique_id || savedUsername}
              </p>
              {baseInfo.signature &&
                baseInfo.signature !== "Tidak ada Data" && (
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                    {baseInfo.signature}
                  </p>
                )}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                {basicInfo.region_name &&
                  basicInfo.region_name !== "Tidak ada Data" && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{basicInfo.region_name}</span>
                    </div>
                  )}
                {baseInfo.first_video_time &&
                  baseInfo.first_video_time !== "Tidak ada Data" && (
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>Bergabung: {baseInfo.first_video_time}</span>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-3 sm:p-4 rounded-xl border border-blue-300 dark:border-blue-600 text-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300 truncate">
                {authorIndex.follower_count_show ||
                  formatTikTokNumber(basicInfo.follower_count)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Followers
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 p-3 sm:p-4 rounded-xl border border-purple-300 dark:border-purple-600 text-center">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-300 truncate">
                {authorIndex.aweme_28_count_show || "Tidak ada Data"}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                Videos (28d)
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 p-3 sm:p-4 rounded-xl border border-green-300 dark:border-green-600 text-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300 truncate">
                {authorIndex.video_28_avg_play_count_show || "Tidak ada Data"}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                Avg Views
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 p-3 sm:p-4 rounded-xl border border-orange-300 dark:border-orange-600 text-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-orange-700 dark:text-orange-300 truncate">
                {authorIndex.video_28_avg_interaction_count_show ||
                  "Tidak ada Data"}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Avg Interactions
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 dark:border-yellow-600">
              <CardContent className="p-4 sm:p-6 text-center">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-yellow-800 dark:text-yellow-200 truncate">
                  {authorIndex.region_rank_show || "Tidak ada Data"}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                  Regional Rank
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 truncate">
                  {basicInfo.region_name || "Tidak ada Data"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 dark:border-purple-600">
              <CardContent className="p-4 sm:p-6 text-center">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200 truncate">
                  {authorIndex.category_rank_show || "Tidak ada Data"}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  Category Rank
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 truncate">
                  {baseInfo.category_name || "Tidak ada Data"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            Terakhir diperbarui:{" "}
            {analytics.lastUpdated
              ? new Date(analytics.lastUpdated).toLocaleString("id-ID")
              : "Tidak diketahui"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
