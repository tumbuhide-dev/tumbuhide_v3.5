import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { LandingHeader } from "@/components/landing/landing-header"
import { FooterSection } from "@/components/landing/footer-section"

export const metadata: Metadata = {
  title: "Masuk Akun - Tumbuhide.id",
  description: "Masuk ke akun Tumbuhide.id Anda dan kelola profil link-in-bio Anda.",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Masuk ke Akun</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Selamat datang kembali di Tumbuhide.id</p>
          </div>
          <LoginForm />
        </div>
      </main>
      <FooterSection />
    </div>
  )
}
