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

    const { data, error } = await supabase
      .from("social_links")
      .select("id, platform, username, url, display_order, updated_at")
      .eq("user_id", session.user.id)
      .not("platform", "in", "(instagram,tiktok)")
      .order("display_order");

    if (error) {
      console.error("Error fetching social links:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Social links API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const { platform, username, url, display_order } = await request.json();

    const { data, error } = await supabase
      .from("social_links")
      .insert({
        user_id: session.user.id,
        platform,
        username,
        url,
        display_order,
      })
      .select("id, platform, username, url, display_order, updated_at")
      .single();

    if (error) {
      console.error("Error creating social link:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Social links POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const { id, username, url } = await request.json();

    const { data, error } = await supabase
      .from("social_links")
      .update({ username, url })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select("id, platform, username, url, display_order, updated_at")
      .single();

    if (error) {
      console.error("Error updating social link:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Social links PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("social_links")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting social link:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Social links DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
