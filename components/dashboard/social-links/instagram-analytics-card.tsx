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
  ExternalLink,
  Heart,
  MessageCircle,
  Camera,
  TrendingUp,
  Calendar,
  MapPin,
  Globe,
  Verified,
  Loader2,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  formatNumber,
  formatEngagementRate,
  getEngagementRateColor,
  getEngagementRateLabel,
  formatTimestamp,
  daysSinceLastPost,
  getPostTypeLabel,
  type InstagramAnalytics,
} from "@/lib/trendhero-api";

interface InstagramAnalyticsCardProps {
  username: string;
  socialLinkId?: string;
  onAnalyticsUpdate?: (analytics: InstagramAnalytics) => void;
}

export function InstagramAnalyticsCard({
  username,
  socialLinkId,
  onAnalyticsUpdate,
}: InstagramAnalyticsCardProps) {
  const [analytics, setAnalytics] = useState<InstagramAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadAnalytics();
  }, [username]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/instagram-analytics?username=${username}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/instagram-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          socialLinkId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
        onAnalyticsUpdate?.(data.analytics);
      } else {
        setError(data.error || "Failed to fetch analytics");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!analytics && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Instagram Analytics
          </CardTitle>
          <CardDescription>
            Get detailed insights for @{username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={fetchAnalytics}
            disabled={loading}
            className="w-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
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
            <span>Fetching Instagram analytics...</span>
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
            onClick={fetchAnalytics}
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

  if (!analytics) return null;

  const userInfo = analytics.userInfo;
  const posts = analytics.posts || [];
  // SAFE HANDLING untuk last_post_at
  const daysSince = userInfo.last_post_at
    ? daysSinceLastPost(userInfo.last_post_at)
    : 0;

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Instagram Analytics
            </CardTitle>
            <Button
              onClick={fetchAnalytics}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={userInfo.profile_pic_url || "/placeholder.svg"}
                alt={userInfo.full_name}
              />
              <AvatarFallback>
                {userInfo.full_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{userInfo.full_name}</h3>
                {userInfo.is_verified && (
                  <Verified className="w-4 h-4 text-blue-500" />
                )}
                {userInfo.is_business_account && (
                  <Badge variant="secondary" className="text-xs">
                    Business
                  </Badge>
                )}
                {userInfo.is_private && (
                  <Badge variant="outline" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                @{userInfo.username}
              </p>
              {userInfo.biography && (
                <p className="text-sm mt-2">{userInfo.biography}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {userInfo.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {userInfo.city && `${userInfo.city}, `}
                      {userInfo.country}
                    </span>
                  </div>
                )}
                {userInfo.external_url && (
                  <a
                    href={userInfo.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
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
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(userInfo.follower_count)}
              </div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(userInfo.following_count)}
              </div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(userInfo.media_count)}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getEngagementRateColor(
                  analytics.engagementRate
                )}`}
              >
                {formatEngagementRate(analytics.engagementRate)}
              </div>
              <div className="text-xs text-gray-500">Engagement Rate</div>
            </div>
          </div>

          {/* Engagement Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-lg font-semibold">
                  {formatNumber(analytics.avgLikes)}
                </div>
                <div className="text-xs text-gray-500">Avg Likes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-semibold">
                  {formatNumber(analytics.avgComments)}
                </div>
                <div className="text-xs text-gray-500">Avg Comments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-semibold">
                  {getEngagementRateLabel(analytics.engagementRate)}
                </div>
                <div className="text-xs text-gray-500">ER Quality</div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Status */}
          {userInfo.last_post_at && userInfo.last_post_at > 0 && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Last Post:</span>
                <span className="text-sm font-medium">
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
                  <h4 className="text-sm font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {userInfo.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {userInfo.topics?.user_defined?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-1">
                    {userInfo.topics.user_defined.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Posts */}
      {posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>
              Latest {posts.length} posts with engagement data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.slice(0, 6).map((post) => (
                <Card key={post.pk} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {getPostTypeLabel(post.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(post.taken_at)}
                        </span>
                      </div>

                      {post.caption && (
                        <p className="text-sm line-clamp-3">
                          {post.caption.substring(0, 100)}...
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            <span>{formatNumber(post.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-blue-500" />
                            <span>{formatNumber(post.comments)}</span>
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
      )}
    </div>
  );
}
