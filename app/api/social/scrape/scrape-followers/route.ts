import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { scrapeFollowers, canScrape } from "@/lib/social-scraper";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform, username, linkId } = await request.json();

    if (!platform || !username || !linkId) {
      return NextResponse.json(
        { error: "Platform, username, and linkId required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (!canScrape(platform, username)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Wait 5 minutes." },
        { status: 429 }
      );
    }

    // Clean username
    const cleanUsername = username.replace("@", "").trim();

    // Scrape followers
    const result = await scrapeFollowers(platform, cleanUsername);

    if (result.success) {
      // Update database
      const { error: updateError } = await supabase
        .from("social_links")
        .update({
          followers_count: result.followers,
          last_scraped_at: new Date().toISOString(),
        })
        .eq("id", linkId)
        .eq("user_id", user.id); // Security check

      if (updateError) {
        console.error("Database update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update database" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        platform,
        username: cleanUsername,
        followers: result.followers,
        lastUpdated: result.lastUpdated.toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to scrape followers" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
