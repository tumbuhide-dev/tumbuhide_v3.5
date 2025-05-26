import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/landing-header"
import { FooterSection } from "@/components/landing/footer-section"
import { generateSEO } from "@/lib/seo"
import { BRAND } from "@/lib/constants"

export const metadata: Metadata = generateSEO({
  title: "Tentang Kami - Agensi Kreatif untuk Content Creator",
  description: `Pelajari lebih lanjut tentang ${BRAND.COMPANY_NAME} dan misi kami membantu content creator Indonesia berkembang.`,
})

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">Tentang {BRAND.COMPANY_NAME}</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">{BRAND.TAGLINE}</p>

            <h2>Misi Kami</h2>
            <p>
              Kami percaya bahwa setiap content creator Indonesia memiliki potensi untuk berkembang dan sukses. Platform
              kami dirancang khusus untuk membantu creator mengelola semua aspek digital mereka dalam satu tempat.
            </p>

            <h2>Visi Kami</h2>
            <p>
              Menjadi platform #1 di Indonesia yang menghubungkan content creator dengan audience dan brand, menciptakan
              ekosistem kreatif yang berkelanjutan.
            </p>

            <h2>Tim Kami</h2>
            <p>
              Tim {BRAND.COMPANY_NAME} terdiri dari profesional berpengalaman di bidang teknologi, digital marketing,
              dan content creation yang memahami kebutuhan creator Indonesia.
            </p>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  )
}
