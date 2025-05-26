// Analytics cache system for local storage and memory
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface AnalyticsCache {
  instagram: Map<string, CacheItem<any>>;
  tiktok: Map<string, CacheItem<any>>;
}

class AnalyticsCacheManager {
  private cache: AnalyticsCache = {
    instagram: new Map(),
    tiktok: new Map(),
  };

  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly STORAGE_KEY = "tumbuhide_analytics_cache";

  constructor() {
    this.loadFromStorage();
  }

  // Save to localStorage
  private saveToStorage() {
    try {
      const cacheData = {
        instagram: Array.from(this.cache.instagram.entries()),
        tiktok: Array.from(this.cache.tiktok.entries()),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to save cache to localStorage:", error);
    }
  }

  // Load from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache.instagram = new Map(cacheData.instagram || []);
        this.cache.tiktok = new Map(cacheData.tiktok || []);

        // Clean expired items
        this.cleanExpired();
      }
    } catch (error) {
      console.warn("Failed to load cache from localStorage:", error);
    }
  }

  // Clean expired cache items
  private cleanExpired() {
    const now = Date.now();

    for (const [key, item] of this.cache.instagram.entries()) {
      if (now > item.expiresAt) {
        this.cache.instagram.delete(key);
      }
    }

    for (const [key, item] of this.cache.tiktok.entries()) {
      if (now > item.expiresAt) {
        this.cache.tiktok.delete(key);
      }
    }

    this.saveToStorage();
  }

  // Get cached data
  get<T>(platform: "instagram" | "tiktok", username: string): T | null {
    const cacheMap = this.cache[platform];
    const item = cacheMap.get(username.toLowerCase());

    if (!item) return null;

    const now = Date.now();
    if (now > item.expiresAt) {
      cacheMap.delete(username.toLowerCase());
      this.saveToStorage();
      return null;
    }

    return item.data as T;
  }

  // Set cached data
  set<T>(platform: "instagram" | "tiktok", username: string, data: T): void {
    const now = Date.now();
    const cacheMap = this.cache[platform];

    cacheMap.set(username.toLowerCase(), {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    });

    this.saveToStorage();
  }

  // Check if data is cached and valid
  has(platform: "instagram" | "tiktok", username: string): boolean {
    return this.get(platform, username) !== null;
  }

  // Get cache info
  getCacheInfo(
    platform: "instagram" | "tiktok",
    username: string
  ): {
    cached: boolean;
    timestamp?: number;
    expiresAt?: number;
    minutesUntilExpiry?: number;
  } {
    const cacheMap = this.cache[platform];
    const item = cacheMap.get(username.toLowerCase());

    if (!item) {
      return { cached: false };
    }

    const now = Date.now();
    const minutesUntilExpiry = Math.max(
      0,
      Math.ceil((item.expiresAt - now) / (1000 * 60))
    );

    return {
      cached: true,
      timestamp: item.timestamp,
      expiresAt: item.expiresAt,
      minutesUntilExpiry,
    };
  }

  // Clear cache for specific platform/username
  clear(platform?: "instagram" | "tiktok", username?: string): void {
    if (platform && username) {
      this.cache[platform].delete(username.toLowerCase());
    } else if (platform) {
      this.cache[platform].clear();
    } else {
      this.cache.instagram.clear();
      this.cache.tiktok.clear();
    }

    this.saveToStorage();
  }

  // Get all cached usernames for a platform
  getCachedUsernames(platform: "instagram" | "tiktok"): string[] {
    return Array.from(this.cache[platform].keys());
  }
}

// Export singleton instance
export const analyticsCache = new AnalyticsCacheManager();

// Helper functions
export function formatCacheTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getCacheStatus(
  platform: "instagram" | "tiktok",
  username: string
): {
  status: "fresh" | "stale" | "expired" | "none";
  message: string;
} {
  const info = analyticsCache.getCacheInfo(platform, username);

  if (!info.cached) {
    return { status: "none", message: "No cached data" };
  }

  if (info.minutesUntilExpiry! > 15) {
    return {
      status: "fresh",
      message: `Fresh data (expires in ${info.minutesUntilExpiry} minutes)`,
    };
  } else if (info.minutesUntilExpiry! > 0) {
    return {
      status: "stale",
      message: `Stale data (expires in ${info.minutesUntilExpiry} minutes)`,
    };
  } else {
    return { status: "expired", message: "Expired data" };
  }
}
