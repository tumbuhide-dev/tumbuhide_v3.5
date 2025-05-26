import type { Metadata } from "next"
import { CompleteProfileForm } from "@/components/profile/complete-profile-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Lengkapi Profil - Tumbuhide.id",
  description: "Lengkapi profil Anda untuk mulai menggunakan Tumbuhide.id",
}

export default async function CompleteProfilePage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if profile exists and is complete
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, plan")
    .eq("id", user.id)
    .maybeSingle() // Fix: gunakan maybeSingle()

  // Jika profile sudah lengkap, redirect sesuai kondisi
  if (profile?.username && profile?.full_name) {
    if (!profile.plan || profile.plan === "basic") {
      redirect("/plan-selection")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lengkapi Profil Anda</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Isi informasi dasar untuk membuat profil link-in-bio Anda
          </p>
        </div>
        <CompleteProfileForm userId={user.id} userEmail={user.email || ""} />
      </div>
    </div>
  )
}
