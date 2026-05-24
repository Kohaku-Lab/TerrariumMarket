<template>
  <footer
    class="border-t border-warm-200/60 dark:border-warm-700/60 bg-warm-50/50 dark:bg-warm-950/50 mt-12"
  >
    <div class="container-page !py-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="flex items-center gap-3">
        <span
          class="w-6 h-6 rounded-md bg-gradient-to-br from-iolite to-taaffeite flex items-center justify-center"
        >
          <span class="i-carbon-cube-view text-white text-[12px]" />
        </span>
        <div class="text-[12px] text-warm-500 dark:text-warm-400 leading-tight">
          <div class="font-medium text-warm-700 dark:text-warm-300">{{ SITE_NAME }}</div>
          <div>{{ SITE_TAGLINE }}</div>
        </div>
      </div>

      <div class="flex-1" />

      <nav class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
        <a
          :href="`https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-warm-500 dark:text-warm-400 hover:text-iolite dark:hover:text-iolite-light inline-flex items-center gap-1"
        >
          <span class="i-carbon-logo-github text-[13px]" />
          Source
        </a>
        <a
          :href="`https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/blob/main/CONTRIBUTING.md`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-warm-500 dark:text-warm-400 hover:text-iolite dark:hover:text-iolite-light"
        >
          Contribute
        </a>
        <a
          href="https://github.com/Kohaku-Blueleaf/KohakuTerrarium"
          target="_blank"
          rel="noopener noreferrer"
          class="text-warm-500 dark:text-warm-400 hover:text-iolite dark:hover:text-iolite-light"
        >
          Framework
        </a>
        <router-link
          :to="{ name: 'about' }"
          class="text-warm-500 dark:text-warm-400 hover:text-iolite dark:hover:text-iolite-light"
        >
          About
        </router-link>
      </nav>
    </div>
  </footer>
</template>

<script setup>
import { SITE_NAME, SITE_TAGLINE, REGISTRY_OWNER, REGISTRY_REPO } from "@/config"
</script>
