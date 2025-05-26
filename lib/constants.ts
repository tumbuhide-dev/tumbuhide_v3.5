// Brand & Company Constants
export const BRAND = {
  COMPANY_NAME: "Tumbuh Ide",
  COMPANY_SHORT: "Tumbuh Ide",
  APP_NAME: "Tumbuhide.id",
  APP_DESCRIPTION: "Agensi Kreatif untuk Content Creator & Brand Partnership",
  TAGLINE: "Agensi Kreatif untuk Content Creator & Brand Partnership",
  DOMAIN: "tumbuhide.id",
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://tumbuhide.id",
  EMAIL: {
    PARTNERSHIPS: "partnerships@tumbuhide.com",
    SUPPORT: "support@tumbuhide.com",
    NOREPLY: "noreply@tumbuhide.com",
  },
  SOCIAL: {
    TWITTER: "https://twitter.com/tumbuhide",
    INSTAGRAM: "https://instagram.com/tumbuhide",
    LINKEDIN: "https://linkedin.com/company/tumbuhide",
    TIKTOK: "https://tiktok.com/@tumbuhide",
    YOUTUBE: "https://youtube.com/@tumbuhide",
  },
  ASSETS: {
    LOGO: "/logo.svg",
    LOGO_DARK: "/logo-dark.svg",
    FAVICON: "/favicon.ico",
    DEFAULT_AVATAR: "https://api.dicebear.com/7.x/avataaars/svg",
    DEFAULT_COVER: "/placeholder-cover.jpg",
  },
  COLORS: {
    PRIMARY: "#8B5CF6", // Purple
    SECONDARY: "#F59E0B", // Yellow/Amber
    ACCENT: "#FFFFFF", // White
  },
} as const;

// Export as CONSTANTS for backward compatibility
export const CONSTANTS = BRAND;

// Theme Constants
export const THEME = {
  PRIMARY_COLOR: "#8B5CF6",
  SECONDARY_COLOR: "#F59E0B",
  ACCENT_COLOR: "#FFFFFF",
} as const;

// SEO Constants
export const SEO = {
  KEYWORDS: [
    "content creator",
    "brand partnership",
    "influencer",
    "social media",
    "link in bio",
    "indonesia",
    "agensi kreatif",
  ] as const,
  AUTHOR: "Tumbuh Ide",
  LANGUAGE: "id-ID",
  REGION: "ID",
  SITE_TYPE: "website",
} as const;

// Feature Flags
export const FEATURES = {
  ANALYTICS: true,
  TESTIMONIALS: true,
  COLLABORATION_FORM: true,
  DARK_MODE: true,
  REGISTRATION: true,
  MAINTENANCE_MODE: false,
  REAL_TIME_FOLLOWERS: true,
} as const;

// Security Constants
export const SECURITY = {
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 900000, // 15 minutes
  },
  CONTENT_LIMITS: {
    MAX_BIO_LENGTH: 500,
    MAX_USERNAME_LENGTH: 30,
    MAX_CUSTOM_LINKS_BASIC: 50,
    MAX_CUSTOM_LINKS_PRO: -1, // unlimited
    MAX_SOCIAL_LINKS_BASIC: 10,
    MAX_SOCIAL_LINKS_PRO: -1, // unlimited
    MAX_SHOWCASE_ITEMS_BASIC: 0,
    MAX_SHOWCASE_ITEMS_PRO: 20,
  },
} as const;

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  SUPPORTED: [
    {
      id: "instagram",
      name: "Instagram",
      icon: "📷",
      color: "#E4405F",
      urlPattern: "https://instagram.com/{username}",
      usernamePattern: "@{username}",
      supportsFollowers: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: "🎵",
      color: "#000000",
      urlPattern: "https://tiktok.com/@{username}",
      usernamePattern: "@{username}",
      supportsFollowers: true,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "📘",
      color: "#1877F2",
      urlPattern: "https://facebook.com/{username}",
      usernamePattern: "{username}",
      supportsFollowers: true,
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: "🐦",
      color: "#1DA1F2",
      urlPattern: "https://twitter.com/{username}",
      usernamePattern: "@{username}",
      supportsFollowers: true,
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "📺",
      color: "#FF0000",
      urlPattern: "https://youtube.com/@{username}",
      usernamePattern: "@{username}",
      supportsFollowers: true,
    },
  ],
} as const;

// Default Values
export const DEFAULTS = {
  AVATAR_API: "https://api.dicebear.com/7.x/avataaars/svg",
  AVATAR_API_BACKUP: "https://ui-avatars.com/api",
  COVER_PLACEHOLDER: "https://picsum.photos/800/200?random=",
  INVITATION_CODES: ["CREATOR2024", "TUMBUHIDE2024", "INFLUENCER2024"],
  MIN_AGE: 17,
  MAX_AGE: 80,
} as const;

// PWA Configuration
export const PWA = {
  NAME: "Tumbuhide.id",
  SHORT_NAME: "Tumbuhide",
  DESCRIPTION: "Agensi Kreatif untuk Content Creator",
} as const;

// Social Media APIs
export const SOCIAL_APIS = {
  INSTAGRAM: {
    ENABLED: true,
    API_ENDPOINT: "/api/social/instagram",
  },
  TIKTOK: {
    ENABLED: true,
    API_ENDPOINT: "/api/social/tiktok",
  },
  FACEBOOK: {
    ENABLED: true,
    API_ENDPOINT: "/api/social/facebook",
  },
  TWITTER: {
    ENABLED: true,
    API_ENDPOINT: "/api/social/twitter",
  },
  YOUTUBE: {
    ENABLED: true,
    API_ENDPOINT: "/api/social/youtube",
  },
} as const;
