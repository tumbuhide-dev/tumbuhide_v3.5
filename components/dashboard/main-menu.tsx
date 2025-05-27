import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Link as LinkIcon, Sparkles, Video, BarChart3, Crown } from "lucide-react";
import Link from "next/link";

interface MainMenuProps {
  plan: string;
}

export function MainMenu({ plan }: MainMenuProps) {
  const menuItems = [
    {
      title: "Profil",
      description: "Kelola informasi profil Anda",
      icon: Users,
      href: "/dashboard/profile",
      color: "text-purple-600 dark:text-purple-400",
      gradient: "hover:from-purple-50 hover:to-yellow-50 dark:hover:from-purple-900/20 dark:hover:to-yellow-900/20",
      border: "hover:border-purple-200 dark:hover:border-purple-700"
    },
    {
      title: "Social Link",
      description: "Kelola tautan media sosial",
      icon: LinkIcon,
      href: "/dashboard/social-links",
      color: "text-yellow-600 dark:text-yellow-400",
      gradient: "hover:from-yellow-50 hover:to-purple-50 dark:hover:from-yellow-900/20 dark:hover:to-purple-900/20",
      border: "hover:border-yellow-200 dark:hover:border-yellow-700"
    },
    {
      title: "Custom Link",
      description: "Tambah tautan khusus",
      icon: Sparkles,
      href: "/dashboard/custom-links",
      color: "text-purple-600 dark:text-purple-400",
      gradient: "hover:from-purple-50 hover:to-yellow-50 dark:hover:from-purple-900/20 dark:hover:to-yellow-900/20",
      border: "hover:border-purple-200 dark:hover:border-purple-700"
    },
    {
      title: "Showcase",
      description: "Tampilkan video terbaik Anda",
      icon: Video,
      href: "/dashboard/showcase",
      color: "text-yellow-600 dark:text-yellow-400",
      gradient: "hover:from-yellow-50 hover:to-purple-50 dark:hover:from-yellow-900/20 dark:hover:to-purple-900/20",
      border: "hover:border-yellow-200 dark:hover:border-yellow-700",
      pro: true
    },
    {
      title: "Social Analytics",
      description: "Analisis performa media sosial",
      icon: BarChart3,
      href: "/dashboard/social/analytics",
      color: "text-purple-600 dark:text-purple-400",
      gradient: "hover:from-purple-50 hover:to-yellow-50 dark:hover:from-purple-900/20 dark:hover:to-yellow-900/20",
      border: "hover:border-purple-200 dark:hover:border-purple-700",
      pro: true
    }
  ];

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-500/5 to-yellow-500/5">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">
          Menu Utama
        </CardTitle>
        <CardDescription>Akses cepat ke fitur-fitur utama</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Button
              key={item.title}
              variant="outline"
              asChild
              className={`group h-auto p-6 flex flex-col items-start gap-3 hover:bg-gradient-to-br ${item.gradient} border-2 ${item.border} transition-all duration-300 ${
                item.pro && plan !== "pro" ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={item.pro && plan !== "pro"}
            >
              <Link href={item.pro && plan !== "pro" ? "#" : item.href} className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                  <span className="text-sm font-medium">
                    {item.title}
                    {item.pro && (
                      <Crown className="w-4 h-4 text-yellow-400 inline ml-1" />
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                  {item.description}
                </p>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 