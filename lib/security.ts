import type { NextRequest } from "next/server"
import { SECURITY } from "./constants"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, maxRequests = SECURITY.RATE_LIMIT.MAX_REQUESTS): boolean {
  const now = Date.now()
  const windowMs = SECURITY.RATE_LIMIT.WINDOW_MS

  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip") // Cloudflare
  const xForwardedFor = request.headers.get("x-forwarded-for")

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim()
  }

  return "unknown"
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return ""

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .slice(0, 1000) // Limit length
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: "Username minimal 3 karakter" }
  }

  if (username.length > SECURITY.CONTENT_LIMITS.MAX_USERNAME_LENGTH) {
    return { valid: false, error: `Username maksimal ${SECURITY.CONTENT_LIMITS.MAX_USERNAME_LENGTH} karakter` }
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return { valid: false, error: "Username hanya boleh huruf kecil, angka, dan underscore" }
  }

  const forbiddenUsernames = [
    "admin",
    "root",
    "api",
    "www",
    "mail",
    "ftp",
    "localhost",
    "test",
    "demo",
    "support",
    "help",
    "info",
    "contact",
    "about",
    "blog",
    "news",
    "shop",
    "store",
    "app",
    "mobile",
    "web",
    "site",
    "page",
    "tumbuhide",
    "tumbuh",
    "ide",
    "creator",
    "brand",
    "partnership",
    "null",
    "undefined",
    "true",
    "false",
    "login",
    "register",
    "dashboard",
    "profile",
    "settings",
    "admin",
    "moderator",
    "user",
    "guest",
    "anonymous",
    "system",
    "service",
    "bot",
    "webhook",
    "callback",
    "oauth",
    "auth",
    "signin",
    "signup",
    "logout",
    "password",
    "forgot",
    "reset",
    "verify",
    "confirm",
    "activate",
    "deactivate",
    "delete",
    "remove",
    "ban",
    "unban",
    "suspend",
    "unsuspend",
    "block",
    "unblock",
  ]

  if (forbiddenUsernames.includes(username.toLowerCase())) {
    return { valid: false, error: "Username tidak tersedia" }
  }

  return { valid: true }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ["http:", "https:"].includes(urlObj.protocol)
  } catch {
    return false
  }
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password minimal 8 karakter")
  }

  if (password.length > 128) {
    errors.push("Password maksimal 128 karakter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password harus mengandung huruf kecil")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password harus mengandung huruf besar")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password harus mengandung angka")
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
    "dragon",
    "master",
    "shadow",
    "12345678",
    "football",
    "baseball",
    "superman",
    "batman",
    "trustno1",
  ]

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password terlalu umum, gunakan password yang lebih unik")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// XSS Protection
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }

  return text.replace(/[&<>"']/g, (m) => map[m])
}

// SQL Injection Protection (for raw queries)
export function escapeSql(input: string): string {
  return input.replace(/'/g, "''")
}

// Content Security Policy
export function getCSPHeader(): string {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "connect-src 'self' https://api.dicebear.com https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
}
