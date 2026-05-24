<template>
  <div class="container-page max-w-3xl">
    <h1 class="text-2xl font-semibold text-warm-800 dark:text-warm-200 mb-4">About {{ SITE_NAME }}</h1>

    <div class="card p-6 mb-6">
      <p class="text-[14px] text-warm-700 dark:text-warm-300 leading-relaxed mb-4">
        {{ SITE_NAME }} is the public marketplace for
        <a href="https://github.com/Kohaku-Blueleaf/KohakuTerrarium" target="_blank" rel="noopener noreferrer" class="text-iolite dark:text-iolite-light hover:underline font-medium">KohakuTerrarium</a>
        packages — creatures, terrariums, plugins, and tools the community has built.
      </p>

      <p class="text-[14px] text-warm-700 dark:text-warm-300 leading-relaxed mb-4">
        The registry is just a single YAML file in
        <a :href="`https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}`" target="_blank" rel="noopener noreferrer" class="text-iolite dark:text-iolite-light hover:underline font-mono">{{ REGISTRY_OWNER }}/{{ REGISTRY_REPO }}</a
        >. No database, no backend service. Submissions are PRs; the forum is GitHub Discussions on the same repo; auth is GitHub Device Flow.
      </p>

      <p class="text-[14px] text-warm-700 dark:text-warm-300 leading-relaxed">
        This site is a static Vue 3 app deployed on Cloudflare Pages, reading the registry over plain HTTPS. You can fork the data repo and run a competing registry — point the KohakuTerrarium client at your fork's
        <code class="font-mono">registry.yaml</code> URL and it just works.
      </p>
    </div>

    <section class="card p-6 mb-6">
      <h2 class="section-title">Get involved</h2>
      <ul class="space-y-3 text-[14px] text-warm-700 dark:text-warm-300">
        <li class="flex items-start gap-3">
          <span class="i-carbon-add-large text-iolite dark:text-iolite-light text-[18px] shrink-0 mt-0.5" />
          <div>
            <router-link :to="{ name: 'submit' }" class="font-medium text-iolite dark:text-iolite-light hover:underline">Submit a package</router-link>
            — share what you've built.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="i-carbon-chat text-iolite dark:text-iolite-light text-[18px] shrink-0 mt-0.5" />
          <div>
            <router-link :to="{ name: 'forum' }" class="font-medium text-iolite dark:text-iolite-light hover:underline">Join the forum</router-link>
            — questions, show-and-tell, plugin requests.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="i-carbon-logo-github text-iolite dark:text-iolite-light text-[18px] shrink-0 mt-0.5" />
          <div>
            <a :href="`https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/blob/main/CONTRIBUTING.md`" target="_blank" rel="noopener noreferrer" class="font-medium text-iolite dark:text-iolite-light hover:underline">Read CONTRIBUTING.md</a>
            — full submission walkthrough.
          </div>
        </li>
      </ul>
    </section>

    <section class="card p-6">
      <h2 class="section-title">Registry stats</h2>
      <dl class="grid grid-cols-2 gap-4 text-[13px]">
        <div>
          <dt class="text-warm-500 dark:text-warm-400">Packages listed</dt>
          <dd class="font-mono text-2xl font-semibold text-warm-800 dark:text-warm-200">
            {{ registry.packages.length }}
          </dd>
        </div>
        <div>
          <dt class="text-warm-500 dark:text-warm-400">Index updated</dt>
          <dd class="text-warm-700 dark:text-warm-300">
            {{ formatDate(registry.metadata?.generated) || "—" }}
          </dd>
        </div>
      </dl>
      <a :href="registry.metadata?.source || ''" target="_blank" rel="noopener noreferrer" class="text-[12px] text-iolite dark:text-iolite-light hover:underline inline-flex items-center gap-1 mt-4">
        View raw registry.yaml
        <span class="i-carbon-launch text-[10px]" />
      </a>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from "vue"

import { useRegistryStore } from "@/stores/registry"
import { SITE_NAME, REGISTRY_OWNER, REGISTRY_REPO } from "@/config"

const registry = useRegistryStore()

onMounted(() => {
  if (registry.packages.length === 0) registry.fetchRegistry().catch(() => {})
})

function formatDate(iso) {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}
</script>
