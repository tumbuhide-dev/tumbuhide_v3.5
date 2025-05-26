import type { Metadata } from "next";
import { BRAND, SEO } from "./constants";

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  username?: string;
  keywords?: string[];
}

export function generateMetadata({
  title,
  description,
  image,
  url,
  type = "website",
  username,
  keywords,
}: GenerateMetadataProps = {}): Metadata {
  const siteTitle = title ? `${title} | ${BRAND.APP_NAME}` : BRAND.APP_NAME;
  const siteDescription = description || BRAND.APP_DESCRIPTION;
  const siteImage = image || `${BRAND.SITE_URL}/og-image.jpg`;
  const siteUrl = url ? `${BRAND.SITE_URL}${url}` : BRAND.SITE_URL;

  return {
    title: siteTitle,
    description: siteDescription,
    keywords: keywords || [...SEO.KEYWORDS], // Convert readonly to mutable array
    authors: [{ name: SEO.AUTHOR }],
    creator: SEO.AUTHOR,
    publisher: BRAND.COMPANY_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: type as any,
      locale: SEO.LANGUAGE,
      url: siteUrl,
      title: siteTitle,
      description: siteDescription,
      siteName: BRAND.APP_NAME,
      images: [
        {
          url: siteImage,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [siteImage],
      creator: "@tumbuhide",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    alternates: {
      canonical: siteUrl,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateSEO(props: GenerateMetadataProps = {}): Metadata {
  return generateMetadata(props);
}

export function generateProfileMetadata(profile: {
  username: string;
  full_name: string;
  bio?: string | null;
  avatar_url?: string | null;
}) {
  return generateMetadata({
    title: `${profile.full_name} (@${profile.username})`,
    description:
      profile.bio || `Profil ${profile.full_name} di ${BRAND.APP_NAME}`,
    image: profile.avatar_url || undefined,
    url: `/${profile.username}`,
    type: "profile",
    username: profile.username,
  });
}

export function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.COMPANY_NAME,
    url: BRAND.SITE_URL,
    logo: `${BRAND.SITE_URL}/logo.png`,
    description: BRAND.APP_DESCRIPTION,
    sameAs: [
      BRAND.SOCIAL.INSTAGRAM,
      BRAND.SOCIAL.TWITTER,
      BRAND.SOCIAL.LINKEDIN,
      BRAND.SOCIAL.TIKTOK,
      BRAND.SOCIAL.YOUTUBE,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: BRAND.EMAIL.SUPPORT,
      contactType: "Customer Support",
    },
  };
}
