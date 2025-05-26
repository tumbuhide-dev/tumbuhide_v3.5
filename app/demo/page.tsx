import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/landing-header"
import { FooterSection } from "@/components/landing/footer-section"
import { HeroSection } from "@/components/landing/hero-section"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Demo Platform - Lihat Contoh Profil Creator",
  description:
    "Lihat demo platform Tumbuhide.id dan contoh profil content creator yang sudah menggunakan layanan kami.",
})

export default function DemoPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        {/* Reuse HeroSection untuk demo */}
        <HeroSection />

        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Fitur Demo Interaktif</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Coba sendiri bagaimana platform Tumbuhide.id bekerja
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Creator Basic</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Fitur dasar untuk memulai journey sebagai content creator
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li>✅ Link bio unlimited</li>
                  <li>✅ Social media integration</li>
                  <li>✅ Basic analytics</li>
                  <li>❌ Video showcase</li>
                  <li>❌ Custom themes</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-2 border-purple-500">
                <h3 className="text-xl font-semibold mb-4">Creator Pro</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Fitur lengkap untuk content creator profesional</p>
                <ul className="text-left space-y-2 text-sm">
                  <li>✅ Semua fitur Basic</li>
                  <li>✅ Video showcase dari IG, TikTok, YouTube</li>
                  <li>✅ Custom themes & branding</li>
                  <li>✅ Advanced analytics</li>
                  <li>✅ Priority support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  )
}
