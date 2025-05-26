// TrendHero API integration for Instagram analytics

export interface TrendHeroUserInfo {
  id: string;
  username: string;
  connected_fb_page: string;
  business_category_name: string;
  overall_category_name: string;
  profile_pic_url: string;
  full_name: string;
  external_url: string;
  biography: string;
  pk: number;
  follower_count: number;
  following_count: number;
  media_count: number;
  er: number;
  er_rank_by_categories: Record<string, string>;
  is_private: boolean;
  is_verified: boolean;
  has_profile_pic: boolean;
  is_business_account: boolean;
  country: string;
  city: string;
  languages: string[];
  topics: {
    detected: any;
    user_defined: any[];
  };
  cached_timestamp: number;
  last_post_at: number;
}

export interface TrendHeroPost {
  pk: number;
  ig_account_pk: number;
  caption: string;
  thumbnail_src: string;
  shortcode: string;
  location_id: number;
  likes: number;
  comments: number;
  views: number;
  type: number;
  taken_at: number;
  cached_timestamp: number;
  mentions_full: any;
}

export interface TrendHeroResponse {
  preview: {
    user_info: TrendHeroUserInfo;
    posts: TrendHeroPost[];
  };
}

export interface InstagramAnalytics {
  userInfo: TrendHeroUserInfo;
  posts: TrendHeroPost[];
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  totalEngagement: number;
  lastUpdated: Date;
}

// Fetch Instagram analytics from TrendHero API
export async function fetchInstagramAnalytics(
  username: string
): Promise<InstagramAnalytics | null> {
  try {
    const cleanUsername = username.replace("@", "").toLowerCase();

    const response = await fetch(
      `https://trendhero.io/api/get_er_reports?username=${cleanUsername}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TrendHero API error: ${response.status}`);
    }

    const data: TrendHeroResponse = await response.json();

    if (!data.preview?.user_info) {
      throw new Error("Invalid response from TrendHero API");
    }

    const userInfo = data.preview.user_info;
    const posts = data.preview.posts || [];

    // Calculate analytics
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    const avgLikes =
      posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
    const avgComments =
      posts.length > 0 ? Math.round(totalComments / posts.length) : 0;
    const totalEngagement = totalLikes + totalComments;
    const engagementRate = userInfo.er || 0;

    return {
      userInfo,
      posts: posts.slice(0, 12), // Limit to 12 recent posts
      engagementRate,
      avgLikes,
      avgComments,
      totalEngagement,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("TrendHero API error:", error);
    return null;
  }
}

// Format numbers for display
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

// Format engagement rate
export function formatEngagementRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

// Get engagement rate color
export function getEngagementRateColor(rate: number): string {
  if (rate >= 0.06) return "text-green-600"; // Excellent (6%+)
  if (rate >= 0.03) return "text-blue-600"; // Good (3-6%)
  if (rate >= 0.01) return "text-yellow-600"; // Average (1-3%)
  return "text-red-600"; // Poor (<1%)
}

// Get engagement rate label
export function getEngagementRateLabel(rate: number): string {
  if (rate >= 0.06) return "Excellent";
  if (rate >= 0.03) return "Good";
  if (rate >= 0.01) return "Average";
  return "Poor";
}

// Format timestamp
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Calculate days since last post
export function daysSinceLastPost(timestamp: number): number {
  const now = Date.now() / 1000;
  const daysDiff = Math.floor((now - timestamp) / (24 * 60 * 60));
  return daysDiff;
}

// Get post type label
export function getPostTypeLabel(type: number): string {
  switch (type) {
    case 1:
      return "Photo";
    case 2:
      return "Video";
    case 8:
      return "Carousel";
    default:
      return "Post";
  }
}
