"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { MainMenu } from "@/components/dashboard/main-menu";
import { ProfileInfo } from "@/components/dashboard/profile-info";
import { TipsGuide } from "@/components/dashboard/tips-guide";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface DashboardClientPageProps {
  profile: any;
  userId: string;
}

export default function DashboardClientPage({
  profile,
  userId,
}: DashboardClientPageProps) {
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleUpgrade = async (code: string) => {
    try {
      // Validate invite code
      const { data: codeData, error: codeError } = await supabase
        .from("invite_codes")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (codeError || !codeData) {
        throw new Error("Kode undangan tidak valid atau sudah tidak aktif");
      }

      if (codeData.plan_type !== "pro") {
        throw new Error("Kode undangan ini tidak untuk upgrade ke Pro");
      }

      if (codeData.current_uses >= codeData.max_uses) {
        throw new Error("Kode undangan sudah mencapai batas penggunaan");
      }

      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        throw new Error("Kode undangan sudah kedaluwarsa");
      }

      // Update user plan
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ plan: "pro" })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Update invite code usage
      await supabase
        .from("invite_codes")
        .update({
          current_uses: codeData.current_uses + 1,
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .eq("id", codeData.id);

      toast({
        title: "Selamat! 🎉",
        description: "Akun Anda berhasil diupgrade ke Creator Pro!",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Gagal Upgrade",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/50 to-yellow-50/50 dark:from-gray-900 dark:via-purple-900/10 dark:to-yellow-900/10">
      <DashboardHeader profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Selamat Datang, {profile.full_name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Kelola profil dan konten Anda dengan mudah melalui dashboard ini
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-8">
            {/* Main Menu */}
            <MainMenu plan={profile.plan} />

            {/* Analytics Stats */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-yellow-500/5 rounded-2xl blur-xl"></div>
              <div className="relative">
                <DashboardStats userId={userId} />
              </div>
            </div>

            {/* Tips & Panduan */}
            <TipsGuide />
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:w-[400px]">
            <div className="sticky top-8">
              <ProfileInfo
                profile={{
                  username: profile.username,
                  full_name: profile.full_name,
                  email: profile.email,
                  plan: profile.plan,
                  created_at: profile.created_at,
                  is_verified: profile.is_verified,
                }}
                onUpgrade={handleUpgrade}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
