"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Instagram, Twitter, Linkedin, Youtube, Mail, MapPin } from "lucide-react"
import { BRAND } from "@/lib/constants"

export function FooterSection() {
  const footerLinks = {
    product: {
      title: "Produk",
      links: [
        { name: "Fitur", href: "/#features" },
        { name: "Harga", href: "/#pricing" },
        { name: "Demo", href: "/demo" },
        { name: "API", href: "/api-docs" },
      ],
    },
    company: {
      title: "Perusahaan",
      links: [
        { name: "Tentang Kami", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Karir", href: "/careers" },
        { name: "Kontak", href: "/contact" },
      ],
    },
    support: {
      title: "Dukungan",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Panduan", href: "/guides" },
        { name: "Status", href: "/status" },
        { name: "Komunitas", href: "/community" },
      ],
    },
    legal: {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "GDPR", href: "/gdpr" },
      ],
    },
  }

  const socialLinks = [
    { icon: Instagram, href: BRAND.SOCIAL.INSTAGRAM, label: "Instagram" },
    { icon: Twitter, href: BRAND.SOCIAL.TWITTER, label: "Twitter" },
    { icon: Linkedin, href: BRAND.SOCIAL.LINKEDIN, label: "LinkedIn" },
    { icon: Youtube, href: BRAND.SOCIAL.YOUTUBE, label: "YouTube" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold">{BRAND.APP_NAME}</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">{BRAND.APP_DESCRIPTION}</p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{BRAND.EMAIL.PARTNERSHIPS}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Newsletter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Dapatkan Update Terbaru</h3>
            <p className="text-gray-300 text-sm">
              Subscribe newsletter kami untuk mendapatkan tips, update fitur, dan insight terbaru untuk content creator.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Masukkan email Anda"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
            <Button>Subscribe</Button>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-300">© 2024 {BRAND.COMPANY_NAME}. All rights reserved.</div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
