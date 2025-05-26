const COVER_GRADIENTS = [
  "from-blue-400 to-purple-500",
  "from-pink-400 to-red-500",
  "from-green-400 to-blue-500",
  "from-yellow-400 to-orange-500",
  "from-purple-400 to-pink-500",
  "from-indigo-400 to-purple-500",
];

export function generateRandomCover(): string {
  const randomIndex = Math.floor(Math.random() * COVER_GRADIENTS.length);
  const gradient = COVER_GRADIENTS[randomIndex];

  return `/placeholder.svg?height=200&width=800&text=Cover&gradient=${encodeURIComponent(
    gradient
  )}`;
}

// Function to check if user has a saved cover (not generated)
export function hasSavedCover(coverUrl: string | null): boolean {
  if (!coverUrl) return false;

  // If cover URL contains placeholder.svg, it's a generated cover, not saved
  if (coverUrl.includes("placeholder.svg")) return false;

  // If it's a real uploaded image URL, it's saved
  return true;
}

// Function to determine if we should show generated cover or saved cover
export function shouldShowGeneratedCover(
  existingCoverUrl: string | null,
  hasUnsavedChanges: boolean
): boolean {
  // If user has saved cover and no unsaved changes, don't generate
  if (hasSavedCover(existingCoverUrl) && !hasUnsavedChanges) return false;

  // Otherwise, show generated cover
  return true;
}
