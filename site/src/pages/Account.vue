<template>
  <div class="container-page">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-warm-800 dark:text-warm-200 mb-2">Account</h1>
    </header>

    <section v-if="!auth.signedIn" class="card p-12 flex flex-col items-center text-center gap-3">
      <span class="i-carbon-logo-github text-[40px] text-warm-400 dark:text-warm-600" />
      <h2 class="text-base font-semibold text-warm-700 dark:text-warm-300">Not signed in</h2>
      <p class="text-sm text-warm-500 dark:text-warm-400 max-w-md">
        Sign in with GitHub to submit packages, post in the forum, and track your contributions.
      </p>
      <button class="btn-primary mt-2" @click="loginOpen = true">
        <span class="i-carbon-logo-github text-[14px] mr-1.5" />
        Sign in with GitHub
      </button>
      <LoginModal :open="loginOpen" @close="loginOpen = false" />
    </section>

    <template v-else>
      <section class="card p-6 mb-6 flex items-center gap-4">
        <img
          v-if="auth.user?.avatar_url"
          :src="auth.user.avatar_url"
          alt=""
          class="w-16 h-16 rounded-full"
        />
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-warm-800 dark:text-warm-200">
            {{ auth.user?.name || auth.user?.login }}
          </h2>
          <p class="text-[13px] text-warm-500 dark:text-warm-400">@{{ auth.user?.login }}</p>
          <a
            :href="auth.user?.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[12px] text-iolite dark:text-iolite-light hover:underline inline-flex items-center gap-1 mt-1"
          >
            <span class="i-carbon-launch text-[10px]" />
            GitHub profile
          </a>
        </div>
        <button class="btn-secondary !py-1.5" @click="onSignOut">Sign out</button>
      </section>

      <section class="card p-6">
        <h2 class="section-title">Permissions</h2>
        <p class="text-[13px] text-warm-600 dark:text-warm-400 mb-4 leading-relaxed">
          {{ SITE_NAME }} holds a GitHub OAuth token with
          <code class="font-mono text-iolite dark:text-iolite-light">public_repo</code>
          scope. That's enough to fork the registry, push a branch, open a PR, and post to public
          Discussions. No access to private repos, no SSH keys, no email changes.
        </p>
        <p class="text-[13px] text-warm-600 dark:text-warm-400 mb-4 leading-relaxed">
          The token is stored locally in your browser — sign out removes it. You can also revoke it
          any time from GitHub's settings.
        </p>
        <a
          href="https://github.com/settings/applications"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary inline-flex items-center"
        >
          <span class="i-carbon-launch text-[12px] mr-1.5" />
          Manage authorised apps
        </a>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue"

import LoginModal from "@/components/LoginModal.vue"
import { useAuthStore } from "@/stores/auth"
import { SITE_NAME } from "@/config"

const auth = useAuthStore()
const loginOpen = ref(false)

function onSignOut() {
  auth.signOut()
}
</script>
