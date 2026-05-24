<template>
  <header
    class="sticky top-0 z-30 border-b border-warm-200/60 dark:border-warm-700/60 bg-warm-50/85 dark:bg-warm-950/85 backdrop-blur-md"
  >
    <div class="container-page !py-3 flex items-center gap-4">
      <router-link
        :to="{ name: 'browse' }"
        class="flex items-center gap-2 shrink-0 group"
        :title="SITE_NAME"
      >
        <span
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-iolite to-taaffeite flex items-center justify-center shadow-sm"
        >
          <span class="i-carbon-cube-view text-white text-[16px]" />
        </span>
        <span class="hidden sm:block font-semibold text-warm-800 dark:text-warm-200">
          {{ SITE_NAME }}
        </span>
      </router-link>

      <nav class="hidden md:flex items-center gap-1 ml-2">
        <router-link
          v-for="item in nav"
          :key="item.name"
          :to="{ name: item.route }"
          class="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
          :class="
            isActive(item.route)
              ? 'bg-iolite/10 text-iolite dark:text-iolite-light'
              : 'text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 hover:text-warm-800 dark:hover:text-warm-200'
          "
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="flex-1" />

      <button
        type="button"
        class="btn-icon shrink-0"
        :title="t('header.toggleTheme', { mode: theme.label })"
        @click="theme.toggle"
      >
        <span :class="theme.iconClass" class="text-[16px]" />
      </button>

      <router-link
        v-if="!auth.signedIn"
        :to="{ name: 'submit' }"
        class="hidden sm:inline-block btn-secondary shrink-0 !py-1.5"
      >
        <span class="i-carbon-add text-[12px] mr-1" />
        Submit
      </router-link>

      <button
        v-if="!auth.signedIn"
        type="button"
        class="btn-primary shrink-0 !py-1.5"
        @click="onSignIn"
      >
        <span class="i-carbon-logo-github text-[14px] mr-1.5" />
        Sign in
      </button>

      <router-link
        v-else
        :to="{ name: 'account' }"
        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
        :title="auth.user?.login"
      >
        <img
          v-if="auth.user?.avatar_url"
          :src="auth.user.avatar_url"
          alt=""
          class="w-7 h-7 rounded-full"
        />
        <span class="hidden md:block text-[13px] font-medium text-warm-700 dark:text-warm-300">
          {{ auth.user?.login || "Account" }}
        </span>
      </router-link>

      <!-- Mobile menu toggle — for small viewports the nav links
           collapse into a popover.  Implementation kept minimal:
           a single more-actions button that scrolls the user to
           the bottom-bar nav we render below. -->
      <button
        type="button"
        class="md:hidden btn-icon"
        :title="'Menu'"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="i-carbon-menu text-[16px]" />
      </button>
    </div>

    <!-- Mobile nav drawer (slides under the header on small viewports). -->
    <transition name="fade">
      <nav
        v-if="mobileOpen"
        class="md:hidden border-t border-warm-200/60 dark:border-warm-700/60 bg-warm-50/95 dark:bg-warm-950/95"
      >
        <div class="container-page !py-2 flex flex-col gap-1">
          <router-link
            v-for="item in nav"
            :key="item.name"
            :to="{ name: item.route }"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              isActive(item.route)
                ? 'bg-iolite/10 text-iolite dark:text-iolite-light'
                : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
            "
            @click="mobileOpen = false"
          >
            {{ item.label }}
          </router-link>
        </div>
      </nav>
    </transition>
  </header>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import { useThemeStore } from "@/stores/theme"
import { useAuthStore } from "@/stores/auth"
import { SITE_NAME } from "@/config"

const theme = useThemeStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const mobileOpen = ref(false)

// Lightweight in-file translator — keeps the component
// self-contained for now.  Swap with vue-i18n if more locales
// land later.
function t(key, params = {}) {
  const dict = {
    "header.toggleTheme": ({ mode }) => `Switch to ${mode.toLowerCase()} theme`,
  }
  const fn = dict[key]
  return fn ? fn(params) : key
}

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

function onSignIn() {
  // The auth modal is owned by Submit / Forum pages where it's
  // actually needed; navigate the user there so the sign-in is
  // contextual.
  router.push({ name: "submit" })
}
</script>
