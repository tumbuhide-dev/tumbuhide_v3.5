import type { Metadata } from "next";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pengaturan - Dashboard Tumbuhide.id",
  description: "Kelola pengaturan akun dan keamanan",
};

export default async function SettingsPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <DashboardHeader profile={profile} />

      <main className="flex-1 max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pengaturan
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola pengaturan akun dan keamanan Anda
          </p>
        </div>

        <SettingsForm profile={profile} />
      </main>
    </div>
  );
}
