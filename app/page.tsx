import { Suspense } from "react"
import { LandingHeader } from "@/components/landing/landing-header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FooterSection } from "@/components/landing/footer-section"
import { generateSEO } from "@/lib/seo"

export const metadata = generateSEO({
  title: "Tumbuhide.id - Platform Link-in-Bio Terbaik untuk Creator Indonesia",
  description:
    "Buat profil link-in-bio yang menarik, showcase video terbaik Anda, dan dapatkan analytics mendalam untuk mengembangkan personal brand Anda.",
  keywords: ["link in bio", "content creator", "indonesia", "social media", "influencer"],
})

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <HeroSection />
        </Suspense>
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  )
}
