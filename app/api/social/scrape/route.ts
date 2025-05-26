import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Mock scraper - In production, use real APIs or scraping services
async function mockScrapeFollowers(
  platform: string,
  username: string
): Promise<number> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate realistic follower counts based on platform and username
  const baseCount = username.length * 1000;
  const platformMultiplier =
    {
      instagram: 1.5,
      tiktok: 2.0,
      facebook: 1.2,
      twitter: 1.0,
      youtube: 0.8,
    }[platform] || 1.0;

  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  const followers = Math.floor(baseCount * platformMultiplier * randomFactor);

  return Math.max(followers, 100); // Minimum 100 followers
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform, username } = await request.json();

    if (!platform || !username) {
      return NextResponse.json(
        { error: "Platform and username required" },
        { status: 400 }
      );
    }

    // Clean username
    const cleanUsername = username.replace("@", "").trim();

    // Scrape followers (mock implementation)
    const followers = await mockScrapeFollowers(platform, cleanUsername);

    // Update database
    const { error: updateError } = await supabase
      .from("social_links")
      .update({
        follower_count: followers,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("username", cleanUsername);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    return NextResponse.json({
      success: true,
      platform,
      username: cleanUsername,
      followers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
