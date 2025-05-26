"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"
import { FEATURES } from "@/lib/constants"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Wijaya",
      role: "Beauty Content Creator",
      avatar: "/placeholder.svg?height=40&width=40",
      followers: "150K",
      platform: "Instagram",
      content:
        "Tumbuhide.id benar-benar game changer! Sekarang semua link produk dan konten saya tertata rapi dalam satu halaman. Engagement rate naik 40% sejak pakai platform ini.",
      rating: 5,
    },
    {
      name: "Rizki Pratama",
      role: "Tech Reviewer",
      avatar: "/placeholder.svg?height=40&width=40",
      followers: "89K",
      platform: "YouTube",
      content:
        "Analytics yang disediakan sangat detail dan membantu saya memahami audience. Fitur showcase video juga perfect untuk highlight review terbaik saya.",
      rating: 5,
    },
    {
      name: "Maya Sari",
      role: "Lifestyle Influencer",
      avatar: "/placeholder.svg?height=40&width=40",
      followers: "200K",
      platform: "TikTok",
      content:
        "Platform yang user-friendly banget! Setup cuma butuh 5 menit dan langsung bisa dipakai. Tim support juga sangat responsif dan helpful.",
      rating: 5,
    },
    {
      name: "Andi Kurniawan",
      role: "Food Blogger",
      avatar: "/placeholder.svg?height=40&width=40",
      followers: "75K",
      platform: "Instagram",
      content:
        "Sejak pakai Tumbuhide.id, brand partnership saya meningkat drastis. Profil yang professional dan analytics yang jelas bikin brand lebih percaya.",
      rating: 5,
    },
    {
      name: "Dina Maharani",
      role: "Fashion Creator",
      avatar: "/placeholder.svg?height=40&width=40",
      followers: "120K",
      platform: "TikTok",
      content:
        "Love banget sama fitur customization-nya! Bisa disesuaikan dengan brand personal saya. Loading speed juga super cepat, audience ga perlu nunggu lama.",
      rating: 5,
    },
    {
      name: "Budi Santoso",
      role: "Gaming Streamer",
      avatar: "/placeholder.svg?height=40&width=40",
      followers: "95K",
      platform: "Twitch",
      content:
        "Fitur video showcase perfect buat highlight gaming moments saya. Viewers jadi lebih mudah akses semua konten dan social media saya.",
      rating: 5,
    },
  ]

  if (!FEATURES.TESTIMONIALS) {
    return null
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-4 h-4 mr-2" />
            Testimoni
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Dipercaya oleh
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              10,000+ Content Creator
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bergabunglah dengan ribuan content creator yang sudah merasakan manfaat platform kami untuk mengembangkan
            karir mereka.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-blue-600 mb-4" />

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {testimonial.followers} followers • {testimonial.platform}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9/5</div>
              <div className="text-gray-600 dark:text-gray-400">Rating Rata-rata</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">10,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Content Creator</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">500K+</div>
              <div className="text-gray-600 dark:text-gray-400">Link Clicks/Bulan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
