import type { Metadata } from "next";
import { CustomLinksManager } from "@/components/dashboard/custom-links-manager";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Custom Links - Dashboard Tumbuhide.id",
  description: "Kelola custom links Anda",
};

export default async function CustomLinksPage() {
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
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Custom Links
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola custom links dan konten Anda
          </p>
        </div>

        <CustomLinksManager
          userId={user.id}
          userPlan={profile.plan || "basic"}
        />
      </main>
    </div>
  );
}
