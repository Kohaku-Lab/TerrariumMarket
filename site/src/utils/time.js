/**
 * Relative timestamp formatting shared by the forum list + thread
 * pages.  Falls back to a locale date once the delta passes a day.
 */
export function formatRelative(iso) {
  if (!iso) return ""
  try {
    const date = new Date(iso)
    const diff = (Date.now() - date.getTime()) / 1000
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.round(diff / 60)} min ago`
    if (diff < 86400) return `${Math.round(diff / 3600)} h ago`
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return iso
  }
}
