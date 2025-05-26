import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"
import { LandingHeader } from "@/components/landing/landing-header"
import { FooterSection } from "@/components/landing/footer-section"

export const metadata: Metadata = {
  title: "Daftar Akun - Tumbuhide.id",
  description: "Buat akun gratis di Tumbuhide.id dan mulai kelola semua link sosial media Anda dalam satu halaman.",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buat Akun Baru</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Bergabung dengan ribuan content creator lainnya</p>
          </div>
          <RegisterForm />
        </div>
      </main>
      <FooterSection />
    </div>
  )
}
