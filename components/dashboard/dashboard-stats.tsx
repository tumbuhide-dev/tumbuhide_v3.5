"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointer, Link, TrendingUp } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface DashboardStatsProps {
  userId: string;
}

interface Stats {
  totalViews: number;
  todayViews: number;
  totalClicks: number;
  totalLinks: number;
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    todayViews: 0,
    totalClicks: 0,
    totalLinks: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get profile views
        const { data: viewsData } = await supabase
          .from("analytics")
          .select("*")
          .eq("user_id", userId)
          .eq("event_type", "profile_view");

        const totalViews = viewsData?.length || 0;

        // Get today's views
        const today = new Date().toISOString().split("T")[0];
        const todayViews =
          viewsData?.filter((view) => view.created_at.startsWith(today))
            .length || 0;

        // Get link clicks
        const { data: clicksData } = await supabase
          .from("analytics")
          .select("*")
          .eq("user_id", userId)
          .eq("event_type", "link_click");

        const totalClicks = clicksData?.length || 0;

        // Get total links count
        const { data: socialLinks } = await supabase
          .from("social_links")
          .select("id")
          .eq("user_id", userId);

        const { data: customLinks } = await supabase
          .from("custom_links")
          .select("id")
          .eq("user_id", userId);

        const totalLinks =
          (socialLinks?.length || 0) + (customLinks?.length || 0);

        setStats({
          totalViews,
          todayViews,
          totalClicks,
          totalLinks,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, supabase]);

  const statCards = [
    {
      title: "Total Kunjungan",
      value: stats.totalViews,
      description: "Semua waktu",
      icon: Eye,
      color: "text-blue-600",
    },
    {
      title: "Kunjungan Hari Ini",
      value: stats.todayViews,
      description: "24 jam terakhir",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Total Klik Link",
      value: stats.totalClicks,
      description: "Semua link",
      icon: MousePointer,
      color: "text-purple-600",
    },
    {
      title: "Total Link",
      value: stats.totalLinks,
      description: "Social + Custom",
      icon: Link,
      color: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="rounded-full p-2 bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform duration-300">
              <stat.icon className={`h-4 w-4 ${stat.color} transition-colors duration-300`} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold tracking-tight">
              {stat.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500/20 to-yellow-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
