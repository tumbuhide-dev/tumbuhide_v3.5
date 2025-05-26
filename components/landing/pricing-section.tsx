"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Zap, Instagram } from "lucide-react"
import Link from "next/link"
import { FEATURES, BRAND } from "@/lib/constants"

export function PricingSection() {
  const plans = [
    {
      name: "Basic",
      price: "Gratis",
      description: "Sempurna untuk memulai journey sebagai content creator",
      badge: "Paling Populer",
      badgeColor: "bg-gradient-to-r from-purple-500 to-yellow-500",
      features: [
        "Link-in-bio dasar",
        "Maksimal 10 social links",
        "Maksimal 50 custom links",
        "Analytics dasar",
        "Responsive design",
        "SEO optimized",
        "Support email",
        "Uptime 99.9%",
      ],
      cta: "Mulai Gratis",
      ctaVariant: "default" as const,
      href: "/auth/register",
      popular: true,
    },
    {
      name: "Creator Pro",
      price: "Dengan Kode Undangan",
      description: "Fitur lengkap untuk content creator profesional",
      badge: "Eksklusif",
      badgeColor: "bg-gradient-to-r from-purple-600 to-purple-800",
      features: [
        "Semua fitur Basic",
        "Unlimited social & custom links",
        "Video showcase dengan tabs",
        "Analytics advanced dengan insights",
        "Custom branding & themes",
        "Collaboration tools",
        "Priority support",
        "API access",
        "White-label option",
      ],
      cta: "Info Kode Undangan",
      ctaVariant: "outline" as const,
      href: BRAND.SOCIAL.INSTAGRAM,
      popular: false,
    },
  ]

  return (
    <section
      id="pricing"
      className="py-20 bg-gradient-to-br from-yellow-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 bg-gradient-to-r from-yellow-100 to-purple-100 text-purple-800 border-purple-200"
          >
            <Star className="w-4 h-4 mr-2" />
            Harga Transparan
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pilih Paket yang
            <span className="bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">
              {" "}
              Sesuai Kebutuhan
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Mulai gratis dan upgrade dengan kode undangan. Semua paket sudah termasuk hosting dan support dari tim kami.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden ${
                plan.popular ? "ring-2 ring-purple-500 shadow-xl scale-105" : "hover:shadow-lg"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-yellow-500 text-white text-center py-2 text-sm font-medium">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Paling Populer
                </div>
              )}

              <CardHeader className={plan.popular ? "pt-12" : ""}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <Badge className={plan.badgeColor}>
                    {plan.name === "Creator Pro" && <Crown className="w-3 h-3 mr-1" />}
                    {plan.badge}
                  </Badge>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  {plan.name === "Basic" && <span className="text-gray-500 dark:text-gray-400 ml-2">selamanya</span>}
                </div>
                <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {FEATURES.REGISTRATION ? (
                  <Button asChild variant={plan.ctaVariant} className="w-full" size="lg">
                    <Link href={plan.href} target={plan.name === "Creator Pro" ? "_blank" : "_self"}>
                      {plan.name === "Creator Pro" && <Instagram className="w-4 h-4 mr-2" />}
                      {plan.cta}
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full" size="lg">
                    Segera Hadir
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <div className="mt-4">
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              <Instagram className="w-3 h-3 mr-1" />
              Kode undangan Creator Pro tersedia di @tumbuhide
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
