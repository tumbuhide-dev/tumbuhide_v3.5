import type { Metadata } from "next";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/public/public-profile";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, bio, avatar_url")
    .eq("username", resolvedParams.username)
    .single();

  if (!profile) {
    return {
      title: "Profile Not Found - Tumbuhide.id",
      description: "The requested profile could not be found.",
    };
  }

  return {
    title: `${profile.full_name} (@${profile.username}) - Tumbuhide.id`,
    description:
      profile.bio || `Check out ${profile.full_name}'s profile on Tumbuhide.id`,
    openGraph: {
      title: `${profile.full_name} (@${profile.username})`,
      description:
        profile.bio ||
        `Check out ${profile.full_name}'s profile on Tumbuhide.id`,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.full_name} (@${profile.username})`,
      description:
        profile.bio ||
        `Check out ${profile.full_name}'s profile on Tumbuhide.id`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      social_links(*),
      custom_links(*),
      showcase_items(*)
    `
    )
    .eq("username", resolvedParams.username)
    .single();

  if (!profile) {
    notFound();
  }

  return <PublicProfile profile={profile} />;
}
