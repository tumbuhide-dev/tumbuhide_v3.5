import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { action, username, uid, step } = await request.json();

  if (!action) {
    return new NextResponse(
      JSON.stringify({ error: "Missing action parameter" }),
      { status: 400 }
    );
  }

  // Step-by-step analysis
  if (action === "step_by_step_analysis") {
    try {
      if (step === 1) {
        // Step 1: Find UID from username
        if (!username) {
          return new NextResponse(
            JSON.stringify({ error: "Username required for step 1" }),
            { status: 400 }
          );
        }

        // Fix URL - sesuai dengan dokumentasi API
        const findUrl = `https://www.fastmoss.com/api/data/find?type=1&content=${encodeURIComponent(
          username
        )}`;
        console.log(
          "Step 1 - Finding UID for username:",
          username,
          "URL:",
          findUrl
        );

        const findResponse = await fetch(findUrl);
        const findData = await findResponse.json();

        console.log("Step 1 - API Response:", findData);

        // Check response sesuai dokumentasi
        if (findData.code !== 200) {
          return new NextResponse(
            JSON.stringify({
              error: "API Error: " + (findData.msg || "Unknown error"),
            }),
            { status: 400 }
          );
        }

        // Check is_ok field sesuai dokumentasi
        if (!findData.data?.is_ok || findData.data.is_ok === 0) {
          return new NextResponse(
            JSON.stringify({
              error:
                "Akun TikTok tidak ditemukan. Mohon masukkan username dengan benar.",
            }),
            { status: 404 }
          );
        }

        // Check UID exists
        if (!findData.data?.info?.uid) {
          return new NextResponse(
            JSON.stringify({
              error: "UID tidak ditemukan dalam response API",
            }),
            { status: 400 }
          );
        }

        return new NextResponse(
          JSON.stringify({
            uid: findData.data.info.uid,
            basic_info: findData.data.info,
            message: "Username ditemukan, melanjutkan ke analisis profile...",
          }),
          { status: 200 }
        );
      }

      if (step === 2) {
        // Step 2: Get base info (optional, might be empty)
        if (!uid) {
          return new NextResponse(
            JSON.stringify({ error: "UID required for step 2" }),
            { status: 400 }
          );
        }

        console.log("Step 2 - Getting base info for UID:", uid);

        const baseInfoResponse = await fetch(
          `https://www.fastmoss.com/api/author/v3/detail/baseInfo?uid=${uid}`
        );
        const baseInfoData = await baseInfoResponse.json();

        console.log("Step 2 - Base Info Response:", baseInfoData);

        // Step 2 might fail or return empty data, that's OK
        return new NextResponse(
          JSON.stringify({
            baseInfo: baseInfoData.data || {},
            message: "Profile berhasil dianalisis, melanjutkan ke metrics...",
          }),
          { status: 200 }
        );
      }

      if (step === 3) {
        // Step 3: Get full analytics and save to database
        if (!uid) {
          return new NextResponse(
            JSON.stringify({ error: "UID required for step 3" }),
            { status: 400 }
          );
        }

        console.log("Step 3 - Getting full analytics for UID:", uid);

        // Get all analytics data
        const [baseInfoResponse, authorIndexResponse, statInfoResponse] =
          await Promise.all([
            fetch(
              `https://www.fastmoss.com/api/author/v3/detail/baseInfo?uid=${uid}`
            ),
            fetch(
              `https://www.fastmoss.com/api/author/v3/detail/authorIndex?uid=${uid}`
            ),
            fetch(
              `https://www.fastmoss.com/api/author/v3/detail/getStatInfo?uid=${uid}`
            ),
          ]);

        const [baseInfoData, authorIndexData, statInfoData] = await Promise.all(
          [
            baseInfoResponse.json(),
            authorIndexResponse.json(),
            statInfoResponse.json(),
          ]
        );

        console.log("Step 3 - All API Responses:", {
          baseInfo: baseInfoData,
          authorIndex: authorIndexData,
          statInfo: statInfoData,
        });

        // Base info should be available
        if (baseInfoData.code !== 200) {
          return new NextResponse(
            JSON.stringify({
              error: "Gagal mendapatkan informasi dasar",
              details: baseInfoData.msg,
            }),
            { status: 400 }
          );
        }

        // Other data might not be available for all accounts
        const baseInfo = baseInfoData.data || {};
        const authorIndex = authorIndexData.data || {};
        const statInfo = statInfoData.data || {};

        // Validasi data wajib sebelum simpan - pastikan UID ada
        const finalUid = baseInfo.uid || uid;
        if (!finalUid) {
          return new NextResponse(
            JSON.stringify({
              error: "UID tidak valid",
              details: "Tidak dapat mendapatkan UID yang valid dari API",
            }),
            { status: 400 }
          );
        }

        console.log("Step 3 - Saving to database with UID:", finalUid);

        // Save comprehensive data to database dengan handling null values
        const { error: saveError } = await supabase
          .from("tiktok_analytics")
          .upsert({
            user_id: session.user.id,

            // Basic Info - dengan fallback untuk null values
            tiktok_uid: finalUid, // Pastikan UID ada
            unique_id: baseInfo.unique_id || null,
            nickname: baseInfo.nickname || null,
            avatar: baseInfo.avatar || null,
            signature: baseInfo.signature || null,
            region: baseInfo.region || null,
            region_name: baseInfo.region_name || null,
            verify_type: baseInfo.verify_type || "0",
            account_type: baseInfo.account_type || "0",
            category_name: baseInfo.category_name || null,
            category_id: baseInfo.category_id || null,
            first_video_time: baseInfo.first_video_time || null,
            show_shop_tab: baseInfo.show_shop_tab || 0,
            is_shop_author: baseInfo.is_shop_author || 0,
            live_type: baseInfo.live_type || 0,

            // Author Index Data
            follower_count: authorIndex.follower_count || null,
            follower_count_show: authorIndex.follower_count_show || null,
            follower_28_count: authorIndex.follower_28_count || null,
            follower_28_count_show: authorIndex.follower_28_count_show || null,
            follower_28_last_count: authorIndex.follower_28_last_count || null,
            follower_28_count_rate: authorIndex.follower_28_count_rate || null,
            region_rank: authorIndex.region_rank || null,
            region_rank_show: authorIndex.region_rank_show || null,
            last_region_rank: authorIndex.last_region_rank || null,
            region_rank_rate: authorIndex.region_rank_rate || null,
            category_rank: authorIndex.category_rank || null,
            category_rank_show: authorIndex.category_rank_show || null,
            last_category_rank: authorIndex.last_category_rank || null,
            category_rank_rate: authorIndex.category_rank_rate || null,
            flow_index: authorIndex.flow_index || null,
            carry_index: authorIndex.carry_index || null,
            aweme_28_count: authorIndex.aweme_28_count || null,
            aweme_28_count_show: authorIndex.aweme_28_count_show || null,
            live_28_count: authorIndex.live_28_count || null,
            live_28_count_show: authorIndex.live_28_count_show || null,
            last_video_time: authorIndex.last_video_time || null,
            video_28_avg_play_count:
              authorIndex.video_28_avg_play_count || null,
            video_28_avg_play_count_show:
              authorIndex.video_28_avg_play_count_show || null,
            video_28_avg_interaction_count:
              authorIndex.video_28_avg_interaction_count || null,
            video_28_avg_interaction_count_show:
              authorIndex.video_28_avg_interaction_count_show || null,
            goods_28_avg_sole_count:
              authorIndex.goods_28_avg_sole_count || null,
            goods_28_avg_sole_count_show:
              authorIndex.goods_28_avg_sole_count_show || null,
            goods_28_avg_sale_amount:
              authorIndex.goods_28_avg_sale_amount || null,
            live_28_avg_sold_count: authorIndex.live_28_avg_sold_count || null,
            live_28_avg_sold_count_show:
              authorIndex.live_28_avg_sold_count_show || null,
            live_28_avg_sale_amount:
              authorIndex.live_28_avg_sale_amount || null,

            // Stat Info Data
            goods_sale_amount: statInfo.goods_sale_amount || null,
            goods_sale_country_rank: statInfo.goods_sale_country_rank || null,
            goods_sale_country_rank_show:
              statInfo.goods_sale_country_rank_show || null,
            goods_sale_last_country_rank:
              statInfo.goods_sale_last_country_rank || null,
            goods_sale_country_rank_rate:
              statInfo.goods_sale_country_rank_rate || null,
            goods_sale_country_rank_trend:
              statInfo.goods_sale_country_rank_trend || null,
            video_sale_amount: statInfo.video_sale_amount || null,
            video_sale_amount_show: statInfo.video_sale_amount_show || null,
            live_sale_amount: statInfo.live_sale_amount || null,
            live_sale_amount_show: statInfo.live_sale_amount_show || null,
            live_gpm_min: statInfo.live_gpm_min || null,
            live_gpm_min_show: statInfo.live_gpm_min_show || null,
            live_gpm_max: statInfo.live_gpm_max || null,
            live_gpm_max_show: statInfo.live_gpm_max_show || null,
            aweme_min_gpm: statInfo.aweme_min_gpm || null,
            aweme_min_gpm_show: statInfo.aweme_min_gpm_show || null,
            aweme_max_gpm: statInfo.aweme_max_gpm || null,
            aweme_max_gpm_show: statInfo.aweme_max_gpm_show || null,
            aweme_total_count: statInfo.aweme_total_count || null,
            aweme_total_count_show: statInfo.aweme_total_count_show || null,
            aweme_count: statInfo.aweme_count || null,
            aweme_count_show: statInfo.aweme_count_show || null,
            aweme_left_count: statInfo.aweme_left_count || null,
            aweme_left_count_show: statInfo.aweme_left_count_show || null,
            aweme_play_count: statInfo.aweme_play_count || null,
            aweme_play_count_show: statInfo.aweme_play_count_show || null,
            aweme_avg_play_count: statInfo.aweme_avg_play_count || null,
            aweme_avg_play_count_show:
              statInfo.aweme_avg_play_count_show || null,
            aweme_mid_play_count: statInfo.aweme_mid_play_count || null,
            aweme_mid_play_count_show:
              statInfo.aweme_mid_play_count_show || null,
            aweme_avg_interaction_rate: statInfo.aweme_avg_interaction_rate
              ? String(statInfo.aweme_avg_interaction_rate)
              : null,
            aweme_avg_interaction_rate_show:
              statInfo.aweme_avg_interaction_rate_show || null,
            aweme_ipm_count: statInfo.aweme_ipm_count || null,
            aweme_ipm_count_show: statInfo.aweme_ipm_count_show || null,
            aweme_pop_rate: statInfo.aweme_pop_rate || null,
            live_count: statInfo.live_count || null,
            live_count_show: statInfo.live_count_show || null,
            live_avg_time: statInfo.live_avg_time || null,
            live_avg_time_show: statInfo.live_avg_time_show || null,
            live_max_user_count: statInfo.live_max_user_count || null,
            live_max_user_count_show: statInfo.live_max_user_count_show || null,
            live_avg_user_count: statInfo.live_avg_user_count || null,
            live_avg_user_count_show: statInfo.live_avg_user_count_show || null,
            live_mid_user_count: statInfo.live_mid_user_count || null,
            live_mid_user_count_show: statInfo.live_mid_user_count_show || null,
            live_max_peak_count: statInfo.live_max_peak_count || null,
            live_max_peak_count_show: statInfo.live_max_peak_count_show || null,
            live_avg_peak_count: statInfo.live_avg_peak_count || null,
            live_avg_peak_count_show: statInfo.live_avg_peak_count_show || null,
            live_mid_peak_count: statInfo.live_mid_peak_count || null,
            live_mid_peak_count_show: statInfo.live_mid_peak_count_show || null,

            // Management fields
            analysis_step: 3,
            analysis_status: "completed",
            auto_update_enabled: true,
            last_updated: new Date().toISOString(),
          });

        if (saveError) {
          console.error("Error saving TikTok analytics:", saveError);
          return new NextResponse(
            JSON.stringify({
              error: "Gagal menyimpan data ke database",
              details: saveError.message,
            }),
            { status: 500 }
          );
        }

        console.log("Step 3 - Successfully saved to database");

        return new NextResponse(
          JSON.stringify({
            baseInfo: baseInfo,
            authorIndex: authorIndex,
            statInfo: statInfo,
            lastUpdated: new Date().toISOString(),
            message: "Analytics berhasil disimpan!",
          }),
          { status: 200 }
        );
      }
    } catch (error: any) {
      console.error("TikTok Step Analysis Error:", error);
      return new NextResponse(
        JSON.stringify({
          error: "Internal Server Error",
          message: error.message,
        }),
        { status: 500 }
      );
    }
  }

  // Refresh analytics
  if (action === "refresh_analytics") {
    if (!username) {
      return new NextResponse(JSON.stringify({ error: "Username required" }), {
        status: 400,
      });
    }

    try {
      // Get UID first
      const findResponse = await fetch(
        `https://www.fastmoss.com/api/data/find?type=1&content=${encodeURIComponent(
          username
        )}`
      );
      const findData = await findResponse.json();

      if (findData.code !== 200 || !findData.data?.info?.uid) {
        return new NextResponse(
          JSON.stringify({ error: "Failed to refresh analytics" }),
          { status: 400 }
        );
      }

      const uid = findData.data.info.uid;

      // Get fresh analytics data
      const [baseInfoResponse, authorIndexResponse, statInfoResponse] =
        await Promise.all([
          fetch(
            `https://www.fastmoss.com/api/author/v3/detail/baseInfo?uid=${uid}`
          ),
          fetch(
            `https://www.fastmoss.com/api/author/v3/detail/authorIndex?uid=${uid}`
          ),
          fetch(
            `https://www.fastmoss.com/api/author/v3/detail/getStatInfo?uid=${uid}`
          ),
        ]);

      const [baseInfoData, authorIndexData, statInfoData] = await Promise.all([
        baseInfoResponse.json(),
        authorIndexResponse.json(),
        statInfoResponse.json(),
      ]);

      const baseInfo = baseInfoData.data || {};
      const authorIndex = authorIndexData.data || {};
      const statInfo = statInfoData.data || {};

      // Update database
      await supabase
        .from("tiktok_analytics")
        .update({
          follower_count: authorIndex.follower_count,
          follower_count_show: authorIndex.follower_count_show,
          region_rank: authorIndex.region_rank,
          region_rank_show: authorIndex.region_rank_show,
          category_rank: authorIndex.category_rank,
          category_rank_show: authorIndex.category_rank_show,
          video_28_avg_play_count: authorIndex.video_28_avg_play_count,
          video_28_avg_play_count_show:
            authorIndex.video_28_avg_play_count_show,
          aweme_total_count: statInfo.aweme_total_count,
          aweme_total_count_show: statInfo.aweme_total_count_show,
          aweme_play_count: statInfo.aweme_play_count,
          aweme_play_count_show: statInfo.aweme_play_count_show,
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", session.user.id);

      return new NextResponse(
        JSON.stringify({
          baseInfo: baseInfo,
          authorIndex: authorIndex,
          statInfo: statInfo,
          lastUpdated: new Date().toISOString(),
        }),
        { status: 200 }
      );
    } catch (error: any) {
      return new NextResponse(
        JSON.stringify({
          error: "Failed to refresh analytics",
          message: error.message,
        }),
        { status: 500 }
      );
    }
  }

  return new NextResponse(
    JSON.stringify({
      error: "Invalid action",
      message: "Supported actions: step_by_step_analysis, refresh_analytics",
    }),
    { status: 400 }
  );
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
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

    // Reconstruct analytics object
    const analytics = {
      baseInfo: {
        uid: dbAnalytics.tiktok_uid,
        unique_id: dbAnalytics.unique_id,
        nickname: dbAnalytics.nickname,
        signature: dbAnalytics.signature,
        avatar: dbAnalytics.avatar,
        region: dbAnalytics.region,
        verify_type: dbAnalytics.verify_type,
        account_type: dbAnalytics.account_type,
        category_name: dbAnalytics.category_name,
        region_name: dbAnalytics.region_name,
        first_video_time: dbAnalytics.first_video_time,
      },
      authorIndex: {
        follower_count: dbAnalytics.follower_count,
        follower_count_show: dbAnalytics.follower_count_show,
        region_rank: dbAnalytics.region_rank,
        region_rank_show: dbAnalytics.region_rank_show,
        category_rank: dbAnalytics.category_rank,
        category_rank_show: dbAnalytics.category_rank_show,
        video_28_avg_play_count: dbAnalytics.video_28_avg_play_count,
        video_28_avg_play_count_show: dbAnalytics.video_28_avg_play_count_show,
        video_28_avg_interaction_count:
          dbAnalytics.video_28_avg_interaction_count,
        video_28_avg_interaction_count_show:
          dbAnalytics.video_28_avg_interaction_count_show,
        aweme_28_count: dbAnalytics.aweme_28_count,
        aweme_28_count_show: dbAnalytics.aweme_28_count_show,
        flow_index: dbAnalytics.flow_index,
        carry_index: dbAnalytics.carry_index,
      },
      statInfo: {
        aweme_total_count: dbAnalytics.aweme_total_count,
        aweme_total_count_show: dbAnalytics.aweme_total_count_show,
        aweme_play_count: dbAnalytics.aweme_play_count,
        aweme_play_count_show: dbAnalytics.aweme_play_count_show,
        aweme_avg_play_count: dbAnalytics.aweme_avg_play_count,
        aweme_avg_play_count_show: dbAnalytics.aweme_avg_play_count_show,
        aweme_avg_interaction_rate: dbAnalytics.aweme_avg_interaction_rate,
        aweme_avg_interaction_rate_show:
          dbAnalytics.aweme_avg_interaction_rate_show,
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
