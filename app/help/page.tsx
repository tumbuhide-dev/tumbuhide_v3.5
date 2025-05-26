import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/landing-header"
import { FooterSection } from "@/components/landing/footer-section"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Help Center - Bantuan dan FAQ",
  description: "Temukan jawaban untuk pertanyaan umum tentang platform Tumbuhide.id.",
})

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">Help Center</h1>
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-500">Help Center akan segera hadir dengan FAQ lengkap!</p>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  )
}
