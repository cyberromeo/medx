export function getAvatarUrl(seed) {
  if (!seed) return "https://api.dicebear.com/10.x/glyphs/svg?seed=fallback";
  return `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(seed)}`;
}
