"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LinkIcon,
  BarChart3,
  Smartphone,
  Palette,
  Shield,
  Zap,
  Users,
  Globe,
  Video,
  Star,
  Crown,
  TrendingUp,
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: LinkIcon,
      title: "Link-in-Bio Cerdas",
      description: "Kelola semua link sosial media dan website dalam satu halaman yang menarik dan mudah diakses.",
      badge: "Populer",
      color: "text-blue-600",
    },
    {
      icon: BarChart3,
      title: "Analytics Mendalam",
      description: "Pantau performa link Anda dengan analytics real-time dan insights yang actionable.",
      badge: "Pro",
      color: "text-purple-600",
    },
    {
      icon: Video,
      title: "Video Showcase",
      description: "Tampilkan video viral dan konten terbaik Anda dengan player yang responsif.",
      badge: "Pro",
      color: "text-red-600",
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Dioptimalkan untuk mobile dengan loading cepat dan tampilan yang sempurna di semua device.",
      badge: "Gratis",
      color: "text-green-600",
    },
    {
      icon: Palette,
      title: "Kustomisasi Penuh",
      description: "Sesuaikan tampilan profil dengan brand Anda menggunakan tema dan warna custom.",
      badge: "Pro",
      color: "text-pink-600",
    },
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      description: "Data Anda aman dengan enkripsi end-to-end dan backup otomatis setiap hari.",
      badge: "Gratis",
      color: "text-orange-600",
    },
    {
      icon: Users,
      title: "Collaboration Tools",
      description: "Fitur khusus untuk brand partnership dan kolaborasi dengan content creator lain.",
      badge: "Pro",
      color: "text-indigo-600",
    },
    {
      icon: Globe,
      title: "SEO Optimized",
      description: "Profil Anda mudah ditemukan di Google dengan SEO yang sudah dioptimalkan.",
      badge: "Gratis",
      color: "text-teal-600",
    },
    {
      icon: Zap,
      title: "Loading Super Cepat",
      description: "Teknologi terdepan untuk memastikan profil Anda loading dalam hitungan detik.",
      badge: "Gratis",
      color: "text-yellow-600",
    },
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-4 h-4 mr-2" />
            Fitur Lengkap
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Semua yang Anda Butuhkan untuk
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Sukses Online
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Platform all-in-one yang dirancang khusus untuk content creator Indonesia dengan fitur-fitur canggih dan
            mudah digunakan.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  <Badge
                    variant={
                      feature.badge === "Pro" ? "default" : feature.badge === "Populer" ? "secondary" : "outline"
                    }
                    className={feature.badge === "Pro" ? "bg-purple-600" : ""}
                  >
                    {feature.badge === "Pro" && <Crown className="w-3 h-3 mr-1" />}
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Bergabung dengan 10,000+ content creator lainnya</span>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Mulai gratis hari ini, upgrade kapan saja sesuai kebutuhan Anda.
          </p>
        </div>
      </div>
    </section>
  )
}
