<template>
  <div class="container-page">
    <!-- Hero -->
    <section class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-semibold text-warm-800 dark:text-warm-200 mb-2">
        {{ SITE_NAME }}
      </h1>
      <p class="text-sm sm:text-base text-warm-500 dark:text-warm-400 max-w-2xl">{{ SITE_TAGLINE }}. Browse creatures, terrariums, plugins, and tools the community has built, or <router-link :to="{ name: 'submit' }" class="text-iolite dark:text-iolite-light hover:underline font-medium"> share your own</router-link>.</p>
    </section>

    <!-- Search + filters -->
    <section class="card p-3 mb-6 flex flex-col md:flex-row md:items-center gap-3 sticky top-[60px] z-20">
      <div class="relative flex-1">
        <span class="input-icon i-carbon-search text-[15px]" />
        <input v-model="query" type="search" class="input-field !pl-9" :placeholder="`Search ${registry.packages.length || ''} packages…`" />
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" class="chip" :class="!activeTag ? 'chip-iolite' : 'chip-warm hover:bg-warm-200 dark:hover:bg-warm-700'" @click="activeTag = null">all</button>
        <button v-for="tag in availableTags" :key="tag" type="button" class="chip" :class="activeTag === tag ? `chip-${TAG_COLOR[tag] || 'iolite'}` : 'chip-warm hover:bg-warm-200 dark:hover:bg-warm-700'" @click="activeTag = activeTag === tag ? null : tag">
          {{ tag }}
        </button>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <label class="text-[12px] text-warm-500 dark:text-warm-400">Sort</label>
        <select v-model="sort" class="input-field !w-auto !py-1 !text-[12px] cursor-pointer">
          <option value="newest">Newest</option>
          <option value="name">Name (A→Z)</option>
        </select>
        <button type="button" class="btn-icon" :title="'Refresh registry'" :disabled="registry.loading" @click="onRefresh">
          <span class="i-carbon-renew text-[14px]" :class="{ 'kohaku-pulse': registry.loading }" />
        </button>
      </div>
    </section>

    <!-- Status -->
    <section v-if="registry.error" class="card p-4 mb-6 border-coral/40 dark:border-coral/30">
      <div class="flex items-start gap-3">
        <span class="i-carbon-warning-alt-filled text-coral text-[18px] shrink-0 mt-0.5" />
        <div class="flex-1 text-sm">
          <div class="font-medium text-coral mb-1">Could not load registry</div>
          <div class="text-warm-600 dark:text-warm-400 break-words">
            {{ registry.error?.message || String(registry.error) }}
          </div>
          <button class="btn-secondary !py-1 !px-3 !text-[12px] mt-2" @click="onRefresh">Retry</button>
        </div>
      </div>
    </section>

    <!-- Loading skeleton -->
    <section v-if="registry.loading && results.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="card p-4 flex flex-col gap-3 animate-pulse">
        <div class="flex gap-3">
          <div class="w-10 h-10 rounded-lg bg-warm-200 dark:bg-warm-800" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/2 bg-warm-200 dark:bg-warm-800 rounded" />
            <div class="h-3 w-3/4 bg-warm-200 dark:bg-warm-800 rounded" />
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-warm-200 dark:bg-warm-800 rounded" />
          <div class="h-3 w-5/6 bg-warm-200 dark:bg-warm-800 rounded" />
        </div>
      </div>
    </section>

    <!-- Empty -->
    <section v-else-if="results.length === 0" class="card p-12 flex flex-col items-center text-center gap-2">
      <span class="i-carbon-search-locate text-[40px] text-warm-400 dark:text-warm-600" />
      <h3 class="text-base font-semibold text-warm-700 dark:text-warm-300">No matches</h3>
      <p class="text-sm text-warm-500 dark:text-warm-400 max-w-md">
        Try a different search term or clear the tag filter. If you can't find what you're looking for, consider
        <router-link :to="{ name: 'submit' }" class="text-iolite dark:text-iolite-light hover:underline font-medium"> publishing it yourself</router-link>.
      </p>
      <button
        v-if="query || activeTag"
        class="btn-secondary !py-1.5 !px-3 mt-2"
        @click="
          () => {
            query = ''
            activeTag = null
          }
        "
      >
        Clear filters
      </button>
    </section>

    <!-- Card grid -->
    <section v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <PackageCard v-for="pkg in results" :key="pkg.name" :pkg="pkg" @tag-click="(tag) => (activeTag = tag)" />
    </section>

    <!-- Result count + last refresh -->
    <div v-if="results.length > 0" class="mt-6 flex items-center justify-between text-[12px] text-warm-500 dark:text-warm-400">
      <div>
        Showing
        <strong class="text-warm-700 dark:text-warm-300">{{ results.length }}</strong>
        of {{ registry.packages.length }} packages
      </div>
      <div v-if="registry.metadata?.generated">
        Index updated
        <time :datetime="registry.metadata.generated">
          {{ formatDate(registry.metadata.generated) }}
        </time>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import PackageCard from "@/components/PackageCard.vue"
import { useRegistryStore } from "@/stores/registry"
import { SITE_NAME, SITE_TAGLINE, TAG_COLOR } from "@/config"

const registry = useRegistryStore()
const route = useRoute()
const router = useRouter()

const query = ref("")
const activeTag = ref(null)
const sort = ref("newest")

// Sync from query string ?q=&tag=&sort=
onMounted(() => {
  if (typeof route.query.q === "string") query.value = route.query.q
  if (typeof route.query.tag === "string") activeTag.value = route.query.tag
  if (typeof route.query.sort === "string") sort.value = route.query.sort
  registry.fetchRegistry().catch(() => {})
})

// Sync to query string when user changes filters
watch([query, activeTag, sort], () => {
  router.replace({
    name: "browse",
    query: {
      ...(query.value ? { q: query.value } : {}),
      ...(activeTag.value ? { tag: activeTag.value } : {}),
      ...(sort.value !== "newest" ? { sort: sort.value } : {}),
    },
  })
})

const results = computed(() =>
  registry.search({
    query: query.value,
    tag: activeTag.value,
    sort: sort.value,
  }),
)

// Most-common tags appear first; rest fall through to "More…" on
// very tag-rich registries.  For 1.5 the curated set is small so
// we just list them all.
const availableTags = computed(() => registry.allTags)

function onRefresh() {
  registry.fetchRegistry({ force: true }).catch(() => {})
}

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
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
