<template>
  <header class="sticky top-0 z-30 flex items-center gap-2 px-3 h-11 border-b border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-900 shrink-0">
    <!-- Brand mark — gradient + bubble-tea Kohaku overlay -->
    <router-link :to="{ name: 'browse' }" class="flex items-center gap-2 shrink-0" :title="SITE_NAME">
      <BrandMark class="w-7 h-7 rounded-md shrink-0" />
      <span class="hidden sm:block text-sm font-semibold text-warm-700 dark:text-warm-200">
        {{ SITE_NAME }}
      </span>
    </router-link>

    <!-- Primary nav -->
    <nav class="nav-scroll flex items-center gap-0.5 ml-2 min-w-0 overflow-x-auto">
      <router-link v-for="item in nav" :key="item.name" :to="{ name: item.route }" class="px-2.5 py-1 rounded text-[12px] font-medium transition-colors whitespace-nowrap shrink-0" :class="isActive(item.route) ? 'bg-iolite/10 text-iolite dark:text-iolite-light' : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'">
        {{ item.label }}
      </router-link>
    </nav>

    <div class="flex-1" />

    <!-- Theme toggle.  Static class names per branch so UnoCSS's
         class scanner picks both icons up at build time (it scans
         .vue + .js source for literal class strings; dynamic
         :class bindings driven from a Pinia store don't get
         visited reliably). -->
    <button type="button" class="w-7 h-7 flex items-center justify-center rounded text-warm-500 dark:text-warm-400 hover:text-iolite dark:hover:text-iolite-light hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors" :title="`Switch to ${theme.label.toLowerCase()} theme`" @click="theme.toggle">
      <span v-if="theme.isDark" class="i-carbon-sun text-[14px]" aria-hidden="true" />
      <span v-else class="i-carbon-moon text-[14px]" aria-hidden="true" />
    </button>

    <!-- Auth chip — signed in: avatar + username -->
    <router-link v-if="auth.signedIn" :to="{ name: 'account' }" class="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors" :title="auth.user?.login">
      <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" alt="" class="w-5 h-5 rounded-full" />
      <span class="hidden md:block text-[12px] font-medium text-warm-700 dark:text-warm-300">
        {{ auth.user?.login || "Account" }}
      </span>
    </router-link>

    <!-- Auth chip — signed out: single Sign-in button.  The Submit
         action lives on its own page (linked from the nav); no
         second always-visible button here to compete with it. -->
    <button v-else type="button" class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-iolite text-white hover:bg-iolite-shadow transition-colors text-[12px] font-medium shrink-0" @click="loginOpen = true">
      <span class="i-carbon-logo-github text-[12px]" />
      <span class="hidden sm:inline">Sign in</span>
    </button>

    <LoginModal :open="loginOpen" @close="loginOpen = false" />
  </header>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

import BrandMark from "@/components/BrandMark.vue"
import LoginModal from "@/components/LoginModal.vue"
import { useThemeStore } from "@/stores/theme"
import { useAuthStore } from "@/stores/auth"
import { SITE_NAME } from "@/config"

const theme = useThemeStore()
const auth = useAuthStore()
const route = useRoute()

const loginOpen = ref(false)

const nav = computed(() => [
  { name: "browse", route: "browse", label: "Browse" },
  { name: "submit", route: "submit", label: "Submit" },
  { name: "forum", route: "forum", label: "Forum" },
  { name: "about", route: "about", label: "About" },
])

function isActive(name) {
  if (name === "forum") return route.name === "forum" || route.name === "forum-thread"
  if (name === "browse") return route.name === "browse" || route.name === "package"
  return route.name === name
}
</script>
