import { FEATURES } from "./constants"

// Google Analytics - disabled untuk demo
export function gtag(...args: any[]) {
  // Disabled untuk demo
  return
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  // Disabled untuk demo
  return
}

export function trackPageView(url: string) {
  // Disabled untuk demo
  return
}

// Umami Analytics - disabled untuk demo
export function trackUmamiEvent(eventName: string, eventData?: Record<string, any>) {
  // Disabled untuk demo
  return
}

// Custom Analytics untuk Supabase
export async function trackCustomEvent(eventType: string, metadata: Record<string, any> = {}, supabase: any) {
  if (!FEATURES.ANALYTICS) return

  try {
    await supabase.from("analytics").insert({
      event_type: eventType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== "undefined" ? navigator.userAgent : "server",
        referrer: typeof window !== "undefined" ? document.referrer : "",
      },
    })
  } catch (error) {
    console.error("Error tracking custom event:", error)
  }
}
