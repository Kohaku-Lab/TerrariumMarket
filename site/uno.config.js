import {
  defineConfig,
  presetWind,
  presetAttributify,
  presetIcons,
  transformerDirectives,
} from "unocss"

// Mirrors src/kohakuterrarium-frontend/uno.config.js so the
// TerrariumMarket site shares the framework's visual identity.
// Keep these palettes in sync if either side changes.

export default defineConfig({
  presets: [
    presetWind(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      // Gem accent colors — same as the framework
      sapphire: {
        light: "#D6E3F8",
        DEFAULT: "#0F52BA",
        shadow: "#082567",
      },
      aquamarine: {
        light: "#D4EDE8",
        DEFAULT: "#4C9989",
        shadow: "#1B6B5A",
      },
      taaffeite: {
        light: "#E8D5ED",
        DEFAULT: "#A57EAE",
        shadow: "#6B4670",
      },
      iolite: {
        light: "#DDD0F0",
        DEFAULT: "#5A4FCF",
        shadow: "#312A7A",
      },
      amber: {
        light: "#F5E6C8",
        DEFAULT: "#D4920A",
        shadow: "#8B5E00",
      },
      // Functional
      coral: {
        light: "#F5D5D5",
        DEFAULT: "#D46B6B",
        shadow: "#8B3A3A",
      },
      sage: {
        light: "#D5E8DA",
        DEFAULT: "#5A9E6F",
        shadow: "#3A6B48",
      },
      // Warm surface scale (light + dark mode use the same scale)
      warm: {
        50: "#F7F5F2",
        100: "#EFECE7",
        200: "#E0DBD4",
        300: "#C5BFB7",
        400: "#A09A92",
        500: "#8A8480",
        600: "#6A645F",
        700: "#4A4540",
        800: "#3A3632",
        900: "#2A2724",
        950: "#1A1816",
      },
    },
  },
  shortcuts: {
    // Layout
    "container-page": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",
    "section-title": "text-lg font-semibold text-warm-800 dark:text-warm-200 mb-4",

    // Typography
    "text-body": "text-sm text-warm-800 dark:text-warm-200",
    "text-secondary": "text-sm text-warm-500 dark:text-warm-400",
    "text-faint": "text-xs text-warm-400 dark:text-warm-500",

    // Cards
    card: "bg-white dark:bg-warm-900 rounded-xl border border-warm-200/60 dark:border-warm-700/60",
    "card-hover":
      "card hover:border-iolite/40 dark:hover:border-iolite-light/40 hover:shadow-sm transition-all cursor-pointer",

    // Buttons
    "btn-primary":
      "px-4 py-2 rounded-lg bg-iolite text-white hover:bg-iolite-shadow transition-colors font-medium text-sm border-none disabled:opacity-50 disabled:cursor-not-allowed",
    "btn-secondary":
      "px-4 py-2 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 transition-colors font-medium text-sm border border-warm-200/50 dark:border-warm-700/50",
    "btn-ghost":
      "px-3 py-1.5 rounded-lg text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 hover:text-warm-800 dark:hover:text-warm-200 transition-colors text-sm",
    "btn-icon":
      "w-8 h-8 inline-flex items-center justify-center rounded-lg text-warm-500 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 hover:text-warm-800 dark:hover:text-warm-200 transition-colors",

    // Form fields
    "input-field":
      "w-full px-3 py-2 rounded-lg bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-700 text-warm-800 dark:text-warm-200 placeholder-warm-400 dark:placeholder-warm-600 focus:outline-none focus:border-iolite dark:focus:border-iolite-light transition-colors text-sm",
    "input-icon":
      "absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 dark:text-warm-500 pointer-events-none",

    // Badges + chips
    "gem-badge": "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
    chip: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium",
    "chip-iolite": "chip bg-iolite/10 text-iolite dark:text-iolite-light border border-iolite/20",
    "chip-aqua":
      "chip bg-aquamarine/10 text-aquamarine dark:text-aquamarine-light border border-aquamarine/20",
    "chip-taaffeite":
      "chip bg-taaffeite/10 text-taaffeite dark:text-taaffeite-light border border-taaffeite/20",
    "chip-amber": "chip bg-amber/10 text-amber dark:text-amber-light border border-amber/20",
    "chip-coral": "chip bg-coral/10 text-coral dark:text-coral-light border border-coral/20",
    "chip-sage": "chip bg-sage/10 text-sage dark:text-sage-light border border-sage/20",
    "chip-warm":
      "chip bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 border border-warm-200 dark:border-warm-700",
  },
})
