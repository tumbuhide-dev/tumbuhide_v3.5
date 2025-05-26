import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/landing-header"
import { FooterSection } from "@/components/landing/footer-section"
import { generateSEO } from "@/lib/seo"
import { BRAND } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Instagram, MessageCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = generateSEO({
  title: "Kontak Kami - Hubungi Tim Tumbuhide.id",
  description: "Hubungi tim Tumbuhide.id untuk partnership, support, atau pertanyaan lainnya.",
})

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">Hubungi Kami</h1>
            <p className="text-xl text-gray-600">Ada pertanyaan atau ingin berkolaborasi? Kami siap membantu!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Untuk partnership dan kerjasama</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`mailto:${BRAND.EMAIL.PARTNERSHIPS}`}>{BRAND.EMAIL.PARTNERSHIPS}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5" />
                  Instagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Follow untuk update terbaru</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={BRAND.SOCIAL.INSTAGRAM} target="_blank">
                    @tumbuhide
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Bantuan teknis dan support</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`mailto:${BRAND.EMAIL.SUPPORT}`}>{BRAND.EMAIL.SUPPORT}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  )
}
