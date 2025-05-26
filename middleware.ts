import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIP } from "@/lib/security";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Rate limiting
  const clientIP = getClientIP(req);
  const identifier = `${clientIP}:${req.nextUrl.pathname}`;

  if (!rateLimit(identifier)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // Auth check for protected routes
  const protectedRoutes = [
    "/dashboard",
    "/complete-profile",
    "/plan-selection",
  ];
  const authRoutes = ["/auth/login", "/auth/register"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute || isAuthRoute) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (isAuthRoute && session) {
      // Check if profile is complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", session.user.id)
        .single();

      if (!profile?.username || !profile?.full_name) {
        return NextResponse.redirect(new URL("/complete-profile", req.url));
      }

      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
