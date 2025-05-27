import type { Metadata } from "next";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Profil - Dashboard Tumbuhide.id",
  description: "Edit profil dan informasi dasar Anda",
};

export default async function ProfileEditPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader profile={profile} />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola informasi profil dan pengaturan akun Anda
          </p>
        </div>

        <ProfileEditor profile={profile} />
      </main>
    </div>
  );
}
