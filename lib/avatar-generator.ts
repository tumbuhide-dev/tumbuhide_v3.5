export interface AvatarOptions {
  seed?: string
  style?: "avataaars" | "personas" | "initials" | "bottts" | "identicon"
  backgroundColor?: string
  size?: number
}

// Valid background colors untuk DiceBear
const VALID_BG_COLORS = [
  "transparent",
  "b6e3f4", // light blue
  "c0aede", // light purple
  "d1d4f9", // light indigo
  "ffd93d", // yellow
  "6bcf7f", // green
  "ffb3ba", // pink
  "ffdfba", // peach
  "ffffba", // light yellow
  "baffc9", // light green
  "bae1ff", // light blue
]

const AVATAR_STYLES = ["personas", "avataaars", "bottts", "identicon"]
const BACKGROUND_COLORS = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"]

function getRandomBgColor(): string {
  return BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)]
}

export function generateAvatar(options: AvatarOptions = {}): string {
  const { seed = "default", style = "avataaars", backgroundColor = "random", size = 200 } = options

  // Fix backgroundColor
  const bgColor = backgroundColor === "random" ? getRandomBgColor() : backgroundColor

  // Primary API - DiceBear dengan format yang benar
  const diceBearUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=${size}&backgroundColor=${bgColor}`

  return diceBearUrl
}

export function generateAvatarFromName(name: string): string {
  return generateAvatar({
    seed: name,
    style: "avataaars",
    backgroundColor: "random",
  })
}

export function generateAvatarFromUsername(username: string, size = 200): string {
  if (!username) return "/placeholder.svg?height=200&width=200"

  // Use a consistent style and background for each user
  const styleIndex = username.length % AVATAR_STYLES.length
  const bgIndex = username.charCodeAt(0) % BACKGROUND_COLORS.length

  const style = AVATAR_STYLES[styleIndex]
  const backgroundColor = BACKGROUND_COLORS[bgIndex]

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(username)}&size=${size}&backgroundColor=${backgroundColor}`
}

// Fallback untuk UI Avatars jika DiceBear gagal
export function getFallbackAvatar(name: string, size = 200): string {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=8B5CF6&color=fff&bold=true`
}

// Generate random avatar untuk demo
export function generateRandomAvatar(): string {
  const randomSeed = Math.random().toString(36).substring(7)
  return generateAvatar({
    seed: randomSeed,
    style: "avataaars",
  })
}
