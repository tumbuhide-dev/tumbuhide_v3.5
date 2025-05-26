import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { fetchInstagramAnalytics } from "@/lib/trendhero-api";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, socialLinkId } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Fetch analytics from TrendHero
    const analytics = await fetchInstagramAnalytics(username);

    if (!analytics) {
      return NextResponse.json(
        { error: "Failed to fetch Instagram analytics" },
        { status: 400 }
      );
    }

    // Save to database
    const { data: existingAnalytics } = await supabase
      .from("instagram_analytics")
      .select("id")
      .eq("user_id", user.id)
      .eq("username", username.toLowerCase())
      .single();

    const analyticsData = {
      user_id: user.id,
      social_link_id: socialLinkId || null,
      instagram_id: analytics.userInfo.id,
      username: analytics.userInfo.username,
      full_name: analytics.userInfo.full_name,
      profile_pic_url: analytics.userInfo.profile_pic_url,
      biography: analytics.userInfo.biography,
      external_url: analytics.userInfo.external_url,
      follower_count: analytics.userInfo.follower_count,
      following_count: analytics.userInfo.following_count,
      media_count: analytics.userInfo.media_count,
      engagement_rate: analytics.engagementRate,
      is_private: analytics.userInfo.is_private,
      is_verified: analytics.userInfo.is_verified,
      is_business_account: analytics.userInfo.is_business_account,
      country: analytics.userInfo.country,
      city: analytics.userInfo.city,
      languages: analytics.userInfo.languages,
      topics: analytics.userInfo.topics,
      recent_posts: analytics.posts,
      cached_timestamp: analytics.userInfo.cached_timestamp,
      last_post_at: analytics.userInfo.last_post_at,
      last_updated: new Date().toISOString(),
    };

    if (existingAnalytics) {
      // Update existing
      const { error } = await supabase
        .from("instagram_analytics")
        .update(analyticsData)
        .eq("id", existingAnalytics.id);
    } else {
      // Insert new
      const { error } = await supabase
        .from("instagram_analytics")
        .insert(analyticsData);
    }

    // Update social_links table if socialLinkId provided
    if (socialLinkId) {
      await supabase
        .from("social_links")
        .update({
          followers_count: analytics.userInfo.follower_count,
          following_count: analytics.userInfo.following_count,
          media_count: analytics.userInfo.media_count,
          engagement_rate: analytics.engagementRate,
          is_verified: analytics.userInfo.is_verified,
          last_scraped_at: new Date().toISOString(),
          api_data: analytics,
        })
        .eq("id", socialLinkId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      analytics: {
        ...analytics,
        avgLikes: analytics.avgLikes,
        avgComments: analytics.avgComments,
        totalEngagement: analytics.totalEngagement,
      },
    });
  } catch (error) {
    console.error("Instagram analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Get analytics from database
    const { data: dbAnalytics, error } = await supabase
      .from("instagram_analytics")
      .select("*")
      .eq("user_id", user.id)
      .eq("username", username.toLowerCase())
      .single();

    if (error || !dbAnalytics) {
      return NextResponse.json(
        { error: "Analytics not found" },
        { status: 404 }
      );
    }

    // Reconstruct analytics object properly
    const analytics = {
      userInfo: {
        id: dbAnalytics.instagram_id,
        username: dbAnalytics.username,
        full_name: dbAnalytics.full_name,
        profile_pic_url: dbAnalytics.profile_pic_url,
        biography: dbAnalytics.biography,
        external_url: dbAnalytics.external_url,
        follower_count: dbAnalytics.follower_count,
        following_count: dbAnalytics.following_count,
        media_count: dbAnalytics.media_count,
        er: dbAnalytics.engagement_rate,
        is_private: dbAnalytics.is_private,
        is_verified: dbAnalytics.is_verified,
        is_business_account: dbAnalytics.is_business_account,
        country: dbAnalytics.country,
        city: dbAnalytics.city,
        languages: dbAnalytics.languages || [],
        topics: dbAnalytics.topics || { detected: null, user_defined: [] },
        cached_timestamp: dbAnalytics.cached_timestamp,
        last_post_at: dbAnalytics.last_post_at || 0, // SAFE FALLBACK
      },
      posts: dbAnalytics.recent_posts || [],
      engagementRate: dbAnalytics.engagement_rate,
      avgLikes: 0,
      avgComments: 0,
      totalEngagement: 0,
      lastUpdated: new Date(dbAnalytics.last_updated),
    };

    // Calculate averages from posts
    const posts = analytics.posts;
    if (posts && posts.length > 0) {
      const totalLikes = posts.reduce(
        (sum: number, post: any) => sum + (post.likes || 0),
        0
      );
      const totalComments = posts.reduce(
        (sum: number, post: any) => sum + (post.comments || 0),
        0
      );
      analytics.avgLikes = Math.round(totalLikes / posts.length);
      analytics.avgComments = Math.round(totalComments / posts.length);
      analytics.totalEngagement = totalLikes + totalComments;
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Get Instagram analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
