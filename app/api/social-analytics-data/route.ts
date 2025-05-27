import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");

    if (!platform || !["instagram", "tiktok"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    try {
      if (platform === "instagram") {
        const { data, error } = await supabase
          .from("instagram_analytics")
          .select(
            "saved_username, username, full_name, profile_pic_url, follower_count"
          )
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching Instagram data:", error);
          return NextResponse.json({ error: "Server error" }, { status: 500 });
        }

        return NextResponse.json({ data: data || null });
      } else {
        const { data, error } = await supabase
          .from("tiktok_analytics")
          .select("saved_username, nickname, avatar, follower_count")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching TikTok data:", error);
          return NextResponse.json({ error: "Server error" }, { status: 500 });
        }

        return NextResponse.json({ data: data || null });
      }
    } catch (error) {
      console.error("Social analytics data error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
