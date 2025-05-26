"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Crown,
  BarChart3,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface AnalyticsDashboardProps {
  userId: string
  userPlan: string
}

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  todayViews: number
  weekViews: number
  monthViews: number
  topLinks: Array<{
    title: string
    clicks: number
    type: string
  }>
  deviceStats: Array<{
    device: string
    count: number
  }>
  referrerStats: Array<{
    source: string
    count: number
  }>
}

export function AnalyticsDashboard({ userId, userPlan }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    todayViews: 0,
    weekViews: 0,
    monthViews: 0,
    topLinks: [],
    deviceStats: [],
    referrerStats: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Get profile views
      const { data: viewsData } = await supabase
        .from("analytics")
        .select("*")
        .eq("user_id", userId)
        .eq("event_type", "profile_view")

      // Get link clicks
      const { data: clicksData } = await supabase
        .from("analytics")
        .select("*")
        .eq("user_id", userId)
        .eq("event_type", "link_click")

      const totalViews = viewsData?.length || 0
      const totalClicks = clicksData?.length || 0

      // Calculate time-based stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const todayViews = viewsData?.filter((view) => new Date(view.created_at) >= today).length || 0

      const weekViews = viewsData?.filter((view) => new Date(view.created_at) >= weekAgo).length || 0

      const monthViews = viewsData?.filter((view) => new Date(view.created_at) >= monthAgo).length || 0

      // Top links (mock data for demo)
      const topLinks = [
        { title: "Instagram Profile", clicks: 45, type: "social" },
        { title: "YouTube Channel", clicks: 32, type: "social" },
        { title: "Portfolio Website", clicks: 28, type: "custom" },
        { title: "Latest Blog Post", clicks: 15, type: "custom" },
      ]

      // Device stats (mock data)
      const deviceStats = [
        { device: "Mobile", count: Math.floor(totalViews * 0.7) },
        { device: "Desktop", count: Math.floor(totalViews * 0.25) },
        { device: "Tablet", count: Math.floor(totalViews * 0.05) },
      ]

      // Referrer stats (mock data)
      const referrerStats = [
        { source: "Instagram", count: Math.floor(totalViews * 0.4) },
        { source: "Direct", count: Math.floor(totalViews * 0.3) },
        { source: "Google", count: Math.floor(totalViews * 0.2) },
        { source: "TikTok", count: Math.floor(totalViews * 0.1) },
      ]

      setAnalytics({
        totalViews,
        totalClicks,
        todayViews,
        weekViews,
        monthViews,
        topLinks,
        deviceStats,
        referrerStats,
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Kunjungan",
      value: analytics.totalViews,
      description: "Semua waktu",
      icon: Eye,
      color: "text-blue-600",
    },
    {
      title: "Total Klik Link",
      value: analytics.totalClicks,
      description: "Semua link",
      icon: MousePointer,
      color: "text-purple-600",
    },
    {
      title: "Kunjungan Minggu Ini",
      value: analytics.weekViews,
      description: "7 hari terakhir",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Kunjungan Hari Ini",
      value: analytics.todayViews,
      description: "24 jam terakhir",
      icon: Calendar,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pro Feature Banner */}
      {userPlan === "basic" && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Upgrade ke Creator Pro</strong>
                <br />
                Dapatkan analytics advanced dengan insights mendalam dan export data!
              </div>
              <Badge className="bg-purple-600">
                <Crown className="w-3 h-3 mr-1" />
                Pro Feature
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="links">Top Links</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          {userPlan === "pro" && <TabsTrigger value="advanced">Advanced</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performa 30 Hari Terakhir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kunjungan Bulan Ini</span>
                    <span className="font-semibold">{analytics.monthViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kunjungan Minggu Ini</span>
                    <span className="font-semibold">{analytics.weekViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kunjungan Hari Ini</span>
                    <span className="font-semibold">{analytics.todayViews}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.deviceStats.map((device) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.device === "Mobile" && <Smartphone className="w-4 h-4" />}
                        {device.device === "Desktop" && <Monitor className="w-4 h-4" />}
                        {device.device === "Tablet" && <Globe className="w-4 h-4" />}
                        <span className="text-sm">{device.device}</span>
                      </div>
                      <span className="font-semibold">{device.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Link Paling Populer</CardTitle>
              <CardDescription>Link yang paling banyak diklik dalam 30 hari terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{link.title}</div>
                        <Badge variant="secondary" className="text-xs">
                          {link.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{link.clicks}</div>
                      <div className="text-xs text-gray-500">clicks</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sumber Traffic</CardTitle>
              <CardDescription>Dari mana pengunjung menemukan profil Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.referrerStats.map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{referrer.source}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(referrer.count / analytics.totalViews) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-sm w-8">{referrer.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {userPlan === "pro" && (
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Advanced Analytics
                </CardTitle>
                <CardDescription>Insights mendalam untuk Creator Pro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fitur analytics advanced akan segera hadir dengan insights yang lebih mendalam!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
