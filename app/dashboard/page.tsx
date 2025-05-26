import type { Metadata } from "next";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClientPage from "./DashboardClientPage";

export const metadata: Metadata = {
  title: "Dashboard - Tumbuhide.id",
  description: "Kelola profil dan link Anda di dashboard Tumbuhide.id",
};

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    redirect("/complete-profile");
  }

  return <DashboardClientPage profile={profile} userId={session.user.id} />;
}
