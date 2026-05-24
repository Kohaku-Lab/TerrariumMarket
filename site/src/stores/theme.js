import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"

const STORAGE_KEY = "terrariummarket:theme"

/**
 * Light / dark theme toggle, persisted to localStorage.
 *
 * On first paint the inline script in index.html already sets
 * ``html.dark`` from the stored preference + system default, so the
 * store only takes over reactive updates after hydrate() runs.
 */
export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(false)

  function hydrate() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "dark" || stored === "light") {
        isDark.value = stored === "dark"
      } else if (window.matchMedia) {
        isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches
      }
    } catch {
      /* localStorage blocked — fall through with default */
    }
    apply()
  }

  function toggle() {
    isDark.value = !isDark.value
    apply()
    try {
      localStorage.setItem(STORAGE_KEY, isDark.value ? "dark" : "light")
    } catch {
      /* noop */
    }
  }

  function apply() {
    if (isDark.value) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // React to changes (e.g. via devtools).
  watch(isDark, apply)

  const label = computed(() => (isDark.value ? "Light" : "Dark"))
  const iconClass = computed(() => (isDark.value ? "i-carbon-sun" : "i-carbon-moon"))

  return { isDark, hydrate, toggle, label, iconClass }
})
