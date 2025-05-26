import type { Metadata } from "next";
import { ShowcaseManager } from "@/components/dashboard/showcase-manager";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Video Showcase - Dashboard Tumbuhide.id",
  description: "Kelola video showcase dan konten unggulan",
};

export default async function ShowcasePage() {
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

  if (profile.plan === "basic") {
    redirect("/dashboard?upgrade=true");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <DashboardHeader profile={profile} />

      <main className="flex-1 max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Video Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tampilkan video terbaik Anda dari Instagram, TikTok, dan YouTube
          </p>
        </div>

        <ShowcaseManager userId={user.id} userPlan={profile.plan} />
      </main>
    </div>
  );
}
