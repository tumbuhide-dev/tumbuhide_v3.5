import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SocialAnalyticsManager } from "@/components/dashboard/social-analytics/social-analytics-manager";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Social Analytics - Dashboard Tumbuhide.id",
  description: "Analisis mendalam untuk akun social media Anda",
};

export default async function SocialAnalyticsPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.username) {
    redirect("/complete-profile");
  }

  // Check if user has pro plan for analytics
  if (profile.plan !== "pro") {
    redirect("/plan-selection?feature=analytics");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader profile={profile} />
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Social Media Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analisis mendalam untuk akun Instagram dan TikTok Anda
          </p>
        </div>

        <SocialAnalyticsManager
          userId={user.id}
          userPlan={profile.plan || "basic"}
        />
      </main>
    </div>
  );
}
