import type { Metadata } from "next"
import { PlanSelectionForm } from "@/components/plan/plan-selection-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Pilih Paket - Tumbuhide.id",
  description: "Pilih paket yang sesuai dengan kebutuhan Anda",
}

export default async function PlanSelectionPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if profile is complete
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, plan")
    .eq("id", user.id)
    .maybeSingle() // Fix: gunakan maybeSingle()

  if (!profile) {
    redirect("/complete-profile")
  }

  if (!profile.username || !profile.full_name) {
    redirect("/complete-profile")
  }

  // Jika sudah pilih plan dan bukan basic, ke dashboard
  if (profile.plan && profile.plan !== "basic") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pilih Paket Anda</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mulai dengan paket Basic gratis atau upgrade ke Creator Pro
          </p>
        </div>
        <PlanSelectionForm userId={user.id} />
      </div>
    </div>
  )
}
