import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/landing-header"
import { FooterSection } from "@/components/landing/footer-section"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Terms of Service - Syarat dan Ketentuan",
  description: "Syarat dan ketentuan penggunaan platform Tumbuhide.id.",
})

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <div className="prose prose-lg max-w-none">
            <p>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>

            <h2>Penerimaan Syarat</h2>
            <p>Dengan menggunakan layanan kami, Anda setuju untuk terikat dengan syarat dan ketentuan ini...</p>

            <h2>Penggunaan Layanan</h2>
            <p>Anda dapat menggunakan layanan kami untuk...</p>

            <h2>Konten Pengguna</h2>
            <p>Anda bertanggung jawab atas konten yang Anda unggah...</p>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  )
}
