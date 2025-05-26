"use client"
import { useEffect } from "react"
import { PublicProfileBasic } from "./public-profile-basic"
import { PublicProfilePro } from "./public-profile-pro"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { generateAvatarFromUsername } from "@/lib/avatar-generator"

interface PublicProfileProps {
  profile: {
    id: string
    username: string
    full_name: string
    tagline?: string
    location?: string
    birth_date?: string
    pronouns?: string
    avatar_url?: string
    cover_url?: string
    plan: string
    social_links?: any[]
    custom_links?: any[]
    showcase_items?: any[]
  }
}

export function PublicProfile({ profile }: PublicProfileProps) {
  const supabase = createClientComponentClient()

  // Track profile view on client side for better analytics
  useEffect(() => {
    const trackView = async () => {
      try {
        await supabase.from("analytics").insert({
          user_id: profile.id,
          event_type: "profile_view",
          metadata: {
            username: profile.username,
            user_agent: navigator.userAgent,
            referrer: document.referrer,
          },
        })
      } catch (error) {
        console.error("Error tracking profile view:", error)
      }
    }

    trackView()
  }, [profile.id, profile.username, supabase])

  // Generate avatar jika tidak ada
  const avatarUrl = profile.avatar_url || generateAvatarFromUsername(profile.username)

  // Generate cover jika tidak ada
  const coverUrl =
    profile.cover_url || `/placeholder.svg?height=200&width=800&text=${encodeURIComponent(profile.full_name)}`

  // Filter out empty sections
  const hasValidSocialLinks = profile.social_links && profile.social_links.length > 0
  const hasValidCustomLinks = profile.custom_links && profile.custom_links.length > 0
  const hasValidShowcase = profile.showcase_items && profile.showcase_items.length > 0

  const profileData = {
    ...profile,
    avatar_url: avatarUrl,
    cover_url: coverUrl,
    social_links: hasValidSocialLinks ? profile.social_links : [],
    custom_links: hasValidCustomLinks ? profile.custom_links : [],
    showcase_items: hasValidShowcase ? profile.showcase_items : [],
  }

  if (profile.plan === "pro") {
    return <PublicProfilePro profile={profileData} />
  }

  return <PublicProfileBasic profile={profileData} />
}
