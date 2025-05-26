import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/landing-header"
import { FooterSection } from "@/components/landing/footer-section"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Privacy Policy - Kebijakan Privasi",
  description: "Kebijakan privasi Tumbuhide.id tentang bagaimana kami mengumpulkan dan melindungi data Anda.",
})

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none">
            <p>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>

            <h2>Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami...</p>

            <h2>Bagaimana Kami Menggunakan Informasi</h2>
            <p>Kami menggunakan informasi yang kami kumpulkan untuk...</p>

            <h2>Keamanan Data</h2>
            <p>Kami mengimplementasikan langkah-langkah keamanan yang sesuai...</p>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  )
}
