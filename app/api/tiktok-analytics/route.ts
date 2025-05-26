import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { fetchTikTokAnalytics } from "@/lib/fastmoss-api";

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

    // Fetch analytics from FastMoss using 3-step process
    const analytics = await fetchTikTokAnalytics(username);

    if (!analytics) {
      return NextResponse.json(
        { error: "Failed to fetch TikTok analytics" },
        { status: 400 }
      );
    }

    // Save to database
    const { data: existingAnalytics } = await supabase
      .from("tiktok_analytics")
      .select("id")
      .eq("user_id", user.id)
      .eq("unique_id", username.toLowerCase())
      .single();

    const analyticsData = {
      user_id: user.id,
      social_link_id: socialLinkId || null,
      tiktok_uid: analytics.userInfo.uid,
      sec_uid: analytics.userInfo.sec_uid,
      unique_id: analytics.userInfo.unique_id,
      nickname: analytics.userInfo.nickname,
      avatar: analytics.userInfo.avatar,
      signature: analytics.userInfo.signature,
      follower_count: analytics.userInfo.follower_count,
      region: analytics.userInfo.region,
      region_name: analytics.userInfo.region_name,
      category_id: analytics.userInfo.category_id,
      category_name: analytics.userInfo.category_name,
      verify_type: analytics.userInfo.verify_type,
      account_type: analytics.userInfo.account_type,
      show_shop_tab: analytics.userInfo.show_shop_tab,
      is_shop_author: analytics.userInfo.is_shop_author,
      seller_id: analytics.userInfo.seller_id,
      market_category_l1_name: analytics.userInfo.market_category_l1_name,
      live_type: analytics.userInfo.live_type,
      intelligent_type: analytics.userInfo.intelligent_type,
      mcn: analytics.userInfo.mcn,
      first_video_time: analytics.userInfo.first_video_time,
      // Analytics data
      region_rank: analytics.analytics.region_rank,
      last_region_rank: analytics.analytics.last_region_rank,
      region_rank_rate: analytics.analytics.region_rank_rate,
      category_rank: analytics.analytics.category_rank,
      last_category_rank: analytics.analytics.last_category_rank,
      category_rank_rate: analytics.analytics.category_rank_rate,
      flow_index: analytics.analytics.flow_index,
      carry_index: analytics.analytics.carry_index,
      follower_28_count: analytics.analytics.follower_28_count,
      follower_28_last_count: analytics.analytics.follower_28_last_count,
      follower_28_count_rate: analytics.analytics.follower_28_count_rate,
      aweme_28_count: analytics.analytics.aweme_28_count,
      live_28_count: analytics.analytics.live_28_count,
      last_video_time: analytics.analytics.last_video_time,
      video_28_avg_play_count: analytics.analytics.video_28_avg_play_count,
      video_28_avg_interaction_count:
        analytics.analytics.video_28_avg_interaction_count,
      goods_28_avg_sole_count: analytics.analytics.goods_28_avg_sole_count,
      goods_28_avg_sale_amount: analytics.analytics.goods_28_avg_sale_amount,
      live_28_avg_sold_count: analytics.analytics.live_28_avg_sold_count,
      live_28_avg_sale_amount: analytics.analytics.live_28_avg_sale_amount,
      // Display formatted values
      region_rank_show: analytics.analytics.region_rank_show,
      last_region_rank_show: analytics.analytics.last_region_rank_show,
      category_rank_show: analytics.analytics.category_rank_show,
      last_category_rank_show: analytics.analytics.last_category_rank_show,
      follower_count_show: analytics.analytics.follower_count_show,
      follower_28_count_show: analytics.analytics.follower_28_count_show,
      follower_28_last_count_show:
        analytics.analytics.follower_28_last_count_show,
      follower_28_count_rate_show:
        analytics.analytics.follower_28_count_rate_show,
      aweme_28_count_show: analytics.analytics.aweme_28_count_show,
      live_28_count_show: analytics.analytics.live_28_count_show,
      video_28_avg_play_count_show:
        analytics.analytics.video_28_avg_play_count_show,
      video_28_avg_interaction_count_show:
        analytics.analytics.video_28_avg_interaction_count_show,
      goods_28_avg_sole_count_show:
        analytics.analytics.goods_28_avg_sole_count_show,
      goods_28_avg_sale_amount_show:
        analytics.analytics.goods_28_avg_sale_amount_show,
      live_28_avg_sold_count_show:
        analytics.analytics.live_28_avg_sold_count_show,
      live_28_avg_sale_amount_show:
        analytics.analytics.live_28_avg_sale_amount_show,
      auto_update_enabled: true,
      last_updated: new Date().toISOString(),
    };

    if (existingAnalytics) {
      // Update existing
      const { error } = await supabase
        .from("tiktok_analytics")
        .update(analyticsData)
        .eq("id", existingAnalytics.id);
      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from("tiktok_analytics")
        .insert(analyticsData);
      if (error) throw error;
    }

    // Update social_links table if socialLinkId provided
    if (socialLinkId) {
      await supabase
        .from("social_links")
        .update({
          followers_count: analytics.userInfo.follower_count,
          following_count: 0, // TikTok doesn't provide following count
          media_count: analytics.analytics.aweme_28_count,
          engagement_rate: analytics.analytics.flow_index / 100,
          is_verified: analytics.userInfo.verify_type === "1",
          last_scraped_at: new Date().toISOString(),
          api_data: analytics,
        })
        .eq("id", socialLinkId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("TikTok analytics API error:", error);
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
      .from("tiktok_analytics")
      .select("*")
      .eq("user_id", user.id)
      .eq("unique_id", username.toLowerCase())
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
        uid: dbAnalytics.tiktok_uid,
        sec_uid: dbAnalytics.sec_uid,
        unique_id: dbAnalytics.unique_id,
        nickname: dbAnalytics.nickname,
        avatar: dbAnalytics.avatar,
        signature: dbAnalytics.signature,
        follower_count: dbAnalytics.follower_count,
        region: dbAnalytics.region,
        region_name: dbAnalytics.region_name,
        category_id: dbAnalytics.category_id,
        category_name: dbAnalytics.category_name,
        verify_type: dbAnalytics.verify_type,
        account_type: dbAnalytics.account_type,
        show_shop_tab: dbAnalytics.show_shop_tab,
        is_shop_author: dbAnalytics.is_shop_author,
        seller_id: dbAnalytics.seller_id,
        market_category_l1_name: dbAnalytics.market_category_l1_name,
        live_type: dbAnalytics.live_type,
        intelligent_type: dbAnalytics.intelligent_type,
        mcn: dbAnalytics.mcn,
        first_video_time: dbAnalytics.first_video_time,
      },
      analytics: {
        region_rank: dbAnalytics.region_rank,
        last_region_rank: dbAnalytics.last_region_rank,
        region_rank_rate: dbAnalytics.region_rank_rate,
        category_rank: dbAnalytics.category_rank,
        last_category_rank: dbAnalytics.last_category_rank,
        category_rank_rate: dbAnalytics.category_rank_rate,
        flow_index: dbAnalytics.flow_index,
        carry_index: dbAnalytics.carry_index,
        follower_count: dbAnalytics.follower_count,
        follower_28_count: dbAnalytics.follower_28_count,
        follower_28_last_count: dbAnalytics.follower_28_last_count,
        follower_28_count_rate: dbAnalytics.follower_28_count_rate,
        aweme_28_count: dbAnalytics.aweme_28_count,
        live_28_count: dbAnalytics.live_28_count,
        last_video_time: dbAnalytics.last_video_time,
        video_28_avg_play_count: dbAnalytics.video_28_avg_play_count,
        video_28_avg_interaction_count:
          dbAnalytics.video_28_avg_interaction_count,
        goods_28_avg_sole_count: dbAnalytics.goods_28_avg_sole_count,
        goods_28_avg_sale_amount: dbAnalytics.goods_28_avg_sale_amount,
        region: dbAnalytics.region,
        live_28_avg_sold_count: dbAnalytics.live_28_avg_sold_count,
        live_28_avg_sale_amount: dbAnalytics.live_28_avg_sale_amount,
        region_rank_show: dbAnalytics.region_rank_show,
        last_region_rank_show: dbAnalytics.last_region_rank_show,
        region_rank_rate_show: dbAnalytics.region_rank_rate,
        category_rank_show: dbAnalytics.category_rank_show,
        last_category_rank_show: dbAnalytics.last_category_rank_show,
        category_rank_rate_show: dbAnalytics.category_rank_rate,
        follower_count_show: dbAnalytics.follower_count_show,
        follower_28_count_show: dbAnalytics.follower_28_count_show,
        follower_28_last_count_show: dbAnalytics.follower_28_last_count_show,
        follower_28_count_rate_show: dbAnalytics.follower_28_count_rate_show,
        aweme_28_count_show: dbAnalytics.aweme_28_count_show,
        live_28_count_show: dbAnalytics.live_28_count_show,
        video_28_avg_play_count_show: dbAnalytics.video_28_avg_play_count_show,
        video_28_avg_interaction_count_show:
          dbAnalytics.video_28_avg_interaction_count_show,
        goods_28_avg_sole_count_show: dbAnalytics.goods_28_avg_sole_count_show,
        goods_28_avg_sale_amount_show:
          dbAnalytics.goods_28_avg_sale_amount_show,
        region_name: dbAnalytics.region_name,
        live_28_avg_sold_count_show: dbAnalytics.live_28_avg_sold_count_show,
        live_28_avg_sale_amount_show: dbAnalytics.live_28_avg_sale_amount_show,
      },
      lastUpdated: new Date(dbAnalytics.last_updated),
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Get TikTok analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
