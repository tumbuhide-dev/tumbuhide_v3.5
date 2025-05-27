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

    if (!platform) {
      return NextResponse.json({ error: "Platform required" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("analytics_usage")
      .select("count")
      .eq("user_id", session.user.id)
      .eq("platform", platform)
      .eq("date", today)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking daily usage:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ count: data?.count || 0 });
  } catch (error) {
    console.error("Analytics usage error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
