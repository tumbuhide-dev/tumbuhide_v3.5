// FastMoss API integration for TikTok analytics - SESUAI 3 STEP YANG ANDA BERIKAN

export interface FastMossUserInfo {
  uid: string;
  sec_uid: string;
  unique_id: string;
  nickname: string;
  avatar: string;
  follower_count: number;
  region: string;
  category_id: number;
  follower_count_show: string;
  region_name: string;
  signature?: string;
  verify_type?: string;
  account_type?: string;
  category_name?: string;
  show_shop_tab?: number;
  update_at?: number;
  product_category_id?: number[];
  product_category_name?: string;
  is_shop_author?: number;
  seller_id?: string;
  market_category_l1_name?: string[];
  live_type?: number;
  intelligent_type?: number;
  mcn?: any[];
  first_video_time?: string;
}

export interface FastMossAnalytics {
  region_rank: number;
  last_region_rank: number;
  region_rank_rate: string;
  category_rank: number;
  last_category_rank: number;
  category_rank_rate: string;
  flow_index: number;
  carry_index: number;
  follower_count: number;
  follower_28_count: number;
  follower_28_last_count: number;
  follower_28_count_rate: string;
  aweme_28_count: number;
  live_28_count: number;
  last_video_time: string;
  video_28_avg_play_count: number;
  video_28_avg_interaction_count: number;
  goods_28_avg_sole_count: number;
  goods_28_avg_sale_amount: number;
  region: string;
  live_28_avg_sold_count: number;
  live_28_avg_sale_amount: number;
  region_rank_show: string;
  last_region_rank_show: string;
  region_rank_rate_show: string;
  category_rank_show: string;
  last_category_rank_show: string;
  category_rank_rate_show: string;
  follower_count_show: string;
  follower_28_count_show: string;
  follower_28_last_count_show: string;
  follower_28_count_rate_show: string;
  aweme_28_count_show: string;
  live_28_count_show: string;
  video_28_avg_play_count_show: string;
  video_28_avg_interaction_count_show: string;
  goods_28_avg_sole_count_show: string;
  goods_28_avg_sale_amount_show: string;
  region_name: string;
  live_28_avg_sold_count_show: string;
  live_28_avg_sale_amount_show: string;
}

export interface TikTokAnalytics {
  userInfo: FastMossUserInfo;
  analytics: FastMossAnalytics;
  lastUpdated: Date;
}

// Step 1: Get UID from TikTok profile URL - SESUAI CONTOH ANDA
export async function getTikTokUID(username: string): Promise<string | null> {
  try {
    const profileUrl = `https://tiktok.com/@${username}`;
    const encodedUrl = encodeURIComponent(profileUrl);

    const response = await fetch(
      `https://www.fastmoss.com/api/data/find?type=1&content=${encodedUrl}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`FastMoss API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 200 && data.data?.info?.uid) {
      return data.data.info.uid;
    }

    return null;
  } catch (error) {
    console.error("Error getting TikTok UID:", error);
    return null;
  }
}

// Step 2: Get base info from UID - SESUAI CONTOH ANDA
export async function getTikTokBaseInfo(
  uid: string
): Promise<FastMossUserInfo | null> {
  try {
    const response = await fetch(
      `https://www.fastmoss.com/api/author/v3/detail/baseInfo?uid=${uid}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`FastMoss API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 200 && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("Error getting TikTok base info:", error);
    throw error;
  }
}

// Step 3: Get analytics from UID - SESUAI CONTOH ANDA
export async function getTikTokAnalytics(
  uid: string
): Promise<FastMossAnalytics | null> {
  try {
    const response = await fetch(
      `https://www.fastmoss.com/api/author/v3/detail/authorIndex?uid=${uid}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`FastMoss API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 200 && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error("Error getting TikTok analytics:", error);
    throw error;
  }
}

// Combined function - MENGIKUTI 3 STEP YANG ANDA BERIKAN
export async function fetchTikTokAnalytics(
  username: string
): Promise<TikTokAnalytics | null> {
  try {
    const cleanUsername = username.replace("@", "").toLowerCase();

    // Step 1: Get UID
    const uid = await getTikTokUID(cleanUsername);
    if (!uid) {
      throw new Error("Could not get TikTok UID. Please check the username.");
    }

    // Step 2: Get base info
    const userInfo = await getTikTokBaseInfo(uid);
    if (!userInfo) {
      throw new Error(
        "Could not get TikTok user info. User may be private or not found."
      );
    }

    // Step 3: Get analytics
    const analytics = await getTikTokAnalytics(uid);
    if (!analytics) {
      throw new Error(
        "Could not get TikTok analytics. Please try again later."
      );
    }

    return {
      userInfo,
      analytics,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("TikTok analytics error:", error);
    return null;
  }
}

// Format numbers for display
export function formatTikTokNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

// Get engagement quality label
export function getTikTokEngagementLabel(flowIndex: number): string {
  if (flowIndex >= 80) return "Excellent";
  if (flowIndex >= 60) return "Good";
  if (flowIndex >= 40) return "Average";
  return "Poor";
}

// Get engagement color
export function getTikTokEngagementColor(flowIndex: number): string {
  if (flowIndex >= 80) return "text-green-600";
  if (flowIndex >= 60) return "text-blue-600";
  if (flowIndex >= 40) return "text-yellow-600";
  return "text-red-600";
}

// Format rank change - ADDED MISSING FUNCTION
export function formatRankChange(rate: string): {
  color: string;
  label: string;
} {
  const isPositive = rate.startsWith("+");
  const isNegative = rate.startsWith("-");

  if (isPositive) {
    return { color: "text-red-600", label: `↑ ${rate}` };
  } else if (isNegative) {
    return { color: "text-green-600", label: `↓ ${rate.substring(1)}` };
  } else {
    return { color: "text-gray-600", label: rate };
  }
}

// Format timestamp
export function formatTikTokTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
