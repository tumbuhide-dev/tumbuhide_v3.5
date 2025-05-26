import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // Check if profile is complete
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name, plan")
      .eq("id", session.user.id)
      .single()

    if (!profile?.username || !profile?.full_name) {
      redirect("/complete-profile")
    } else if (!profile?.plan || profile.plan === "basic") {
      redirect("/plan-selection")
    } else {
      redirect("/dashboard")
    }
  } else {
    redirect("/auth/login")
  }
}
