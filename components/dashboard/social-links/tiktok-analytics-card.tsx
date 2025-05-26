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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  TrendingUp,
  Users,
  Video,
  Calendar,
  MapPin,
  Verified,
  Loader2,
  Music,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  formatTikTokNumber,
  getTikTokEngagementLabel,
  getTikTokEngagementColor,
  formatRankChange,
  formatTikTokTimestamp,
  type TikTokAnalytics,
} from "@/lib/fastmoss-api";

interface TikTokAnalyticsCardProps {
  username: string;
  socialLinkId?: string;
  onAnalyticsUpdate?: (analytics: TikTokAnalytics) => void;
}

interface TikTokAnalyticsCardProps {
  username: string;
  socialLinkId?: string;
  onAnalyticsUpdate?: (analytics: any) => void;
}

export function TikTokAnalyticsCard({
  username,
  socialLinkId,
  onAnalyticsUpdate,
}: TikTokAnalyticsCardProps) {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, [username]);

  const loadAnalytics = async () => {
    try {
      // Step 1: Get UID from the TikTok profile link
      const uidResponse = await fetch(
        `https://www.fastmoss.com/api/data/find?type=1&content=https://tiktok.com/@${username}`
      );
      const uidData = await uidResponse.json();

      if (!uidData.data?.info?.uid) {
        setError("UID not found for the provided TikTok username.");
        return;
      }
      const uid = uidData.data.info.uid;

      // Step 2: Fetch detailed data using UID
      const baseInfoResponse = await fetch(
        `https://www.fastmoss.com/api/author/v3/detail/baseInfo?uid=${uid}`
      );
      const baseInfoData = await baseInfoResponse.json();

      if (baseInfoData.code !== 200) {
        setError("Failed to fetch base info.");
        return;
      }

      // Step 3: Fetch analytics data using UID
      const analyticsResponse = await fetch(
        `https://www.fastmoss.com/api/author/v3/detail/authorIndex?uid=${uid}`
      );
      const analyticsData = await analyticsResponse.json();

      if (analyticsData.code !== 200) {
        setError("Failed to fetch analytics data.");
        return;
      }

      setAnalytics({
        userInfo: baseInfoData.data,
        analytics: analyticsData.data,
      });
    } catch (error) {
      setError("An error occurred while fetching TikTok analytics.");
      console.error("Error fetching analytics:", error);
    }
  };

  if (!analytics && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            TikTok Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadAnalytics} disabled={loading} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Fetch Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Fetching TikTok analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={loadAnalytics}
            variant="outline"
            className="w-full mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const userInfo = analytics.userInfo;
  const analyticsData = analytics.analytics;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            TikTok Analytics
          </CardTitle>
          <Button
            onClick={loadAnalytics}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Overview */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userInfo.avatar} alt={userInfo.nickname} />
              <AvatarFallback>
                {userInfo.nickname?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{userInfo.nickname}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                @{userInfo.unique_id}
              </p>
              {userInfo.signature && (
                <p className="text-sm mt-2">{userInfo.signature}</p>
              )}
            </div>
          </div>

          {/* Analytics Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.follower_count}
              </div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.aweme_28_count}
              </div>
              <div className="text-xs text-gray-500">Videos (28d)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.video_28_avg_play_count}
              </div>
              <div className="text-xs text-gray-500">Avg Views</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold`}>
                {analyticsData.flow_index}
              </div>
              <div className="text-xs text-gray-500">Flow Index</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
