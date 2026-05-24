<template>
  <AppHeader />
  <main class="flex-1 w-full">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  <AppFooter />
</template>

<script setup>
import { onMounted } from "vue"

import AppHeader from "@/components/AppHeader.vue"
import AppFooter from "@/components/AppFooter.vue"
import { useThemeStore } from "@/stores/theme"
import { useAuthStore } from "@/stores/auth"

const theme = useThemeStore()
const auth = useAuthStore()

onMounted(() => {
  theme.hydrate()
  auth.hydrate()
})
</script>
