"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Crown,
  Instagram,
  Music,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Shield,
  Clock,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { InstagramAnalyticsCard } from "./instagram-analytics-card";
import { TikTokAnalyticsCard } from "./tiktok-analytics-card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SocialAnalyticsManagerProps {
  userId: string;
  userPlan: string;
}

export function SocialAnalyticsManager({
  userId,
  userPlan,
}: SocialAnalyticsManagerProps) {
  const [activeTab, setActiveTab] = useState("instagram");
  const [isFeatureInfoOpen, setIsFeatureInfoOpen] = useState(false);
  const [isImportantNotesOpen, setIsImportantNotesOpen] = useState(false);

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 sm:space-y-8 pb-16">
        {/* Header dengan gradient ungu-kuning */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              asChild
              className="border-purple-300 hover:bg-purple-50 hover:border-purple-400 dark:border-purple-600 dark:hover:bg-purple-900 transition-all duration-300"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Kembali ke Dashboard</span>
                <span className="sm:hidden">Kembali</span>
              </Link>
            </Button>
          </div>

          {/* Hero Section dengan gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-yellow-600 p-6 sm:p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Analytics Pro
                </h1>
              </div>
              <p className="text-purple-100 text-base sm:text-lg max-w-2xl mx-auto">
                Dapatkan insights mendalam untuk Instagram dan TikTok dengan
                analytics yang powerful dan real-time
              </p>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-400/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-purple-400/20 rounded-full blur-lg"></div>
          </div>
        </div>

        {/* Pro Plan Info dengan tema baru */}
        <Alert className="border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-2 dark:border-yellow-700">
          <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  🎉 Fitur Analytics Pro aktif!
                </span>
                <span className="text-yellow-700 dark:text-yellow-300 hidden sm:inline">
                  Nikmati analytics premium tanpa batas
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Important Notes - Collapsible */}
        <Collapsible
          open={isImportantNotesOpen}
          onOpenChange={setIsImportantNotesOpen}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between p-4 border-2 border-blue-300 hover:bg-blue-50 dark:border-blue-600 dark:hover:bg-blue-900"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Informasi Penting & Cara Penggunaan
                </span>
              </div>
              {isImportantNotesOpen ? (
                <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <Alert className="border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 dark:border-blue-700">
              <AlertDescription>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100">
                      Cara Penggunaan Analytics
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        📋 Lihat Analytics (Tanpa Batas)
                      </h5>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-6">
                        <li>• Buka halaman analytics</li>
                        <li>• Sistem otomatis cek username tersimpan</li>
                        <li>
                          • Klik "Lihat Analytics" untuk data dari database
                        </li>
                        <li>
                          • <strong>TIDAK ADA LIMIT</strong> untuk melihat data
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        🔄 Refresh Analytics (Limit 3x/hari)
                      </h5>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-6">
                        <li>• Klik "Refresh" untuk data real-time dari API</li>
                        <li>• Menambah username baru juga terhitung limit</li>
                        <li>
                          • <strong>MAKSIMAL 3x per hari</strong>
                        </li>
                        <li>• Reset setiap hari pada pukul 00:00</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        {/* Analytics Features dengan design card modern - Collapsible */}
        <Collapsible
          open={isFeatureInfoOpen}
          onOpenChange={setIsFeatureInfoOpen}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between p-4 border-2 border-purple-300 hover:bg-purple-50 dark:border-purple-600 dark:hover:bg-purple-900"
            >
              <span className="font-medium text-purple-900 dark:text-purple-100">
                Fitur Analytics Pro
              </span>
              {isFeatureInfoOpen ? (
                <ChevronUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 p-4 sm:p-6 text-white hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold">
                      Instagram Analytics
                    </h3>
                  </div>
                  <ul className="space-y-2 text-pink-100 text-sm sm:text-base">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                      Profile insights & engagement rate
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                      Follower growth & demographics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                      Recent posts performance
                    </li>
                  </ul>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 p-4 sm:p-6 text-white hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Music className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold">
                      TikTok Analytics
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      Creator insights & flow index
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      Regional & category rankings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      28-day performance metrics
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Notes dengan design modern */}
            <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-2 dark:border-purple-700">
              <AlertDescription>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-100">
                      Persyaratan & Batasan
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-purple-800 dark:text-purple-200">
                        📋 Persyaratan Akun
                      </h5>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>
                          • Akun harus bersifat <strong>PUBLIC</strong>
                        </li>
                        <li>• Username valid dan dapat diakses</li>
                        <li>• Akun aktif dengan konten terbaru</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-purple-800 dark:text-purple-200">
                        ⚙️ Sistem Analytics
                      </h5>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• 1 username per platform per user</li>
                        <li>• Data tersimpan permanen</li>
                        <li>• Refresh data kapan saja</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-purple-800 dark:text-purple-200 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        🚀 Limit Penggunaan
                      </h5>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>
                          • Lihat data: <strong>Unlimited</strong>
                        </li>
                        <li>
                          • Refresh API: <strong>3x/hari</strong>
                        </li>
                        <li>• Reset: Setiap hari 00:00</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        {/* Tabs dengan design modern */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 sm:space-y-8"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-1 shadow-lg">
            <TabsTrigger
              value="instagram"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Instagram Analytics</span>
              <span className="sm:hidden">Instagram</span>
            </TabsTrigger>
            <TabsTrigger
              value="tiktok"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-700 data-[state=active]:to-gray-900 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">TikTok Analytics</span>
              <span className="sm:hidden">TikTok</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instagram" className="space-y-6">
            <InstagramAnalyticsCard userId={userId} />
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-6">
            <TikTokAnalyticsCard userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
