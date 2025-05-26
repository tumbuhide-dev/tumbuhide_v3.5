"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Users, TrendingUp, Play } from "lucide-react"
import { generateAvatarFromUsername } from "@/lib/avatar-generator"

// Static demo data to prevent hydration issues
const demoProfiles = [
  {
    id: "1",
    username: "sarah_beauty",
    full_name: "Sarah Wijaya",
    tagline: "Beauty Content Creator & Makeup Artist",
    bio: "Sharing beauty tips and makeup tutorials for Indonesian women. Passionate about skincare and natural beauty.",
    followers: {
      instagram: 150000,
      tiktok: 89000,
      youtube: 45000,
    },
    plan: "pro",
    showcase_videos: [
      {
        id: "1",
        title: "10 Minute Everyday Makeup",
        platform: "Instagram",
        thumbnail_url: "https://picsum.photos/400/300?random=makeup1",
      },
      {
        id: "2",
        title: "Skincare Routine for Acne",
        platform: "TikTok",
        thumbnail_url: "https://picsum.photos/400/300?random=skincare1",
      },
    ],
  },
  {
    id: "2",
    username: "rizki_tech",
    full_name: "Rizki Pratama",
    tagline: "Tech Reviewer & Digital Creator",
    bio: "Reviewing latest gadgets and tech trends. Helping you make better tech decisions.",
    followers: {
      instagram: 75000,
      tiktok: 120000,
      youtube: 95000,
    },
    plan: "basic",
    showcase_videos: [],
  },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatNumber = (num: number) => {
    if (!mounted) return "0" // Prevent hydration mismatch
    return num.toLocaleString("id-ID")
  }

  const getAvatarUrl = (username: string) => {
    if (!mounted) return "/placeholder.svg"
    return generateAvatarFromUsername(username)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            🚀 Platform Link-in-Bio Terbaik untuk Creator Indonesia
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Satu Link untuk
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Semua </span>
            Konten Anda
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Buat profil link-in-bio yang menarik, showcase video terbaik Anda, dan dapatkan analytics mendalam untuk
            mengembangkan personal brand Anda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/register">
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/demo">Lihat Demo</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Gratis Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>10,000+ Creator</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Analytics Real-time</span>
            </div>
          </div>
        </div>

        {/* Demo Profiles */}
        <div id="demo" className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {demoProfiles.map((profile) => (
            <div key={profile.id} className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
              {/* Plan Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge variant={profile.plan === "pro" ? "default" : "secondary"}>
                  {profile.plan === "pro" ? "Creator Pro" : "Basic"}
                </Badge>
              </div>

              {/* Cover */}
              <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>

              {/* Profile Content */}
              <div className="p-6 -mt-8 relative">
                <div className="flex items-end gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    <Image
                      src={getAvatarUrl(profile.username) || "/placeholder.svg"}
                      alt={profile.full_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{profile.full_name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{profile.tagline}</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">{profile.bio}</p>

                {/* Social Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-2 text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">Instagram</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(profile.followers.instagram)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-2 text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">TikTok</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(profile.followers.tiktok)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-2 text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">YouTube</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(profile.followers.youtube)}
                    </div>
                  </div>
                </div>

                {/* Showcase Videos for Pro */}
                {profile.plan === "pro" && profile.showcase_videos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Video Showcase
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.showcase_videos.map((video) => (
                        <div
                          key={video.id}
                          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                        >
                          <Image
                            src={video.thumbnail_url || "/placeholder.svg"}
                            alt={video.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    Follow
                  </Button>
                  <Button size="sm" className="flex-1">
                    Visit Profile
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bergabung dengan ribuan content creator yang sudah mempercayai Tumbuhide.id
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/auth/register">
              Buat Profil Gratis Anda
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

// Also add default export for compatibility
export default HeroSection
