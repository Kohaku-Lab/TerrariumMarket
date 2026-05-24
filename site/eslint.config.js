import pluginVue from "eslint-plugin-vue"
import vuePrettier from "@vue/eslint-config-prettier"

// Flat ESLint config — same baseline the framework frontend uses
// (eslint-plugin-vue's flat/recommended + the Vue-aware Prettier
// disabler), with the same handful of project-specific relaxations
// so the two codebases lint the same way.

export default [
  ...pluginVue.configs["flat/recommended"],
  vuePrettier,
  {
    rules: {
      // Single-word page / component names are fine here — Browse,
      // Forum, Submit etc.
      "vue/multi-word-component-names": "off",
      // <script setup> with defineEmits-as-types is the norm.
      "vue/require-explicit-emits": "off",
      // Prop types optional — most local components don't need them.
      "vue/require-prop-types": "off",
      // We use v-html for sanitised markdown (DOMPurify) — keep
      // visible as a warning so accidental v-html in new code is
      // flagged.
      "vue/no-v-html": "warn",
    },
  },
  {
    // The dev-only Vite middleware uses Node globals.
    files: ["vite.config.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        process: "readonly",
      },
    },
  },
  {
    ignores: ["dist/", "node_modules/", ".vite/"],
  },
]
