<template>
  <div class="container-page">
    <div v-if="!pkg && registry.loading" class="text-warm-500 dark:text-warm-400 text-sm">Loading…</div>

    <div v-else-if="!pkg" class="card p-12 flex flex-col items-center text-center gap-3">
      <span class="i-carbon-search-locate text-[40px] text-warm-400 dark:text-warm-600" />
      <h2 class="text-lg font-semibold text-warm-700 dark:text-warm-300">Package not found</h2>
      <p class="text-sm text-warm-500 dark:text-warm-400">
        No package named "<strong>{{ name }}</strong
        >" exists in the registry.
      </p>
      <router-link :to="{ name: 'browse' }" class="btn-secondary"> Back to Browse </router-link>
    </div>

    <template v-else>
      <!-- Back + breadcrumb -->
      <router-link :to="{ name: 'browse' }" class="text-[12px] text-warm-500 dark:text-warm-400 hover:text-iolite dark:hover:text-iolite-light inline-flex items-center gap-1 mb-4">
        <span class="i-carbon-arrow-left text-[12px]" />
        Back to Browse
      </router-link>

      <!-- Header card -->
      <!-- Icon + text stay one row from sm; the install column only
           moves beside them at lg — at 640–1024px a fixed 18rem side
           column squeezed the title/description into ~half the card. -->
      <header class="card p-4 sm:p-6 mb-6 flex flex-col lg:flex-row gap-5 lg:gap-6">
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1 min-w-0">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-sm" :class="gradientClass">
            <span :class="iconClass" class="text-white text-[28px]" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start flex-wrap gap-3 mb-2">
              <h1 class="text-2xl font-semibold text-warm-800 dark:text-warm-200 leading-tight break-all">
                {{ pkg.name }}
              </h1>
              <span v-if="latestVersion" class="font-mono text-sm text-warm-500 dark:text-warm-400 mt-1.5">
                {{ latestVersion.tag }}
              </span>
              <span v-if="isOfficial" class="chip-amber mt-1.5" :title="'Official package'">
                <span class="i-carbon-checkmark-filled text-[10px]" />
                official
              </span>
            </div>

            <p class="text-warm-600 dark:text-warm-400 text-[14px] leading-relaxed mb-3">
              {{ pkg.description }}
            </p>

            <div class="flex items-center flex-wrap gap-x-4 gap-y-1 text-[12px] text-warm-500 dark:text-warm-400">
              <span class="inline-flex items-center gap-1">
                <span class="i-carbon-user-avatar text-[14px]" />
                <a :href="`https://github.com/${pkg.author}`" target="_blank" rel="noopener noreferrer" class="hover:text-iolite dark:hover:text-iolite-light font-medium text-warm-700 dark:text-warm-300">
                  {{ pkg.author }}
                </a>
              </span>
              <span class="inline-flex items-center gap-1">
                <span class="i-carbon-license text-[14px]" />
                {{ pkg.license }}
              </span>
              <span class="inline-flex items-center gap-1">
                <span class="i-carbon-cube text-[14px]" />
                framework {{ frameworkConstraint }}
              </span>
              <a :href="pkg.repo" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-iolite dark:hover:text-iolite-light">
                <span class="i-carbon-logo-github text-[14px]" />
                Source
              </a>
              <a v-if="pkg.homepage" :href="pkg.homepage" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-iolite dark:hover:text-iolite-light">
                <span class="i-carbon-launch text-[14px]" />
                Homepage
              </a>
            </div>

            <div class="flex flex-wrap gap-1.5 mt-3">
              <TagBadge v-for="tag in displayTags" :key="tag" :tag="tag" @click="onTagClick" />
            </div>
          </div>
        </div>

        <!-- Install column -->
        <div class="lg:w-72 shrink-0 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-warm-200 dark:border-warm-700 pt-4 lg:pt-0 lg:pl-6">
          <label class="text-[11px] uppercase tracking-wider text-warm-500 dark:text-warm-400"> Install </label>

          <select v-if="installableVersions.length > 1" v-model="selectedVersionTag" class="input-field !text-[13px] cursor-pointer">
            <option v-for="v in installableVersions" :key="v.tag" :value="v.tag">
              {{ v.tag }}
              <template v-if="v.released">— {{ v.released }}</template>
              <template v-if="v.yanked">(yanked)</template>
            </option>
          </select>

          <div class="relative font-mono text-[12px] bg-warm-100 dark:bg-warm-950 border border-warm-200 dark:border-warm-700 rounded-lg px-3 py-2 group">
            <code class="break-all">{{ installCommand }}</code>
            <button type="button" class="absolute top-1.5 right-1.5 btn-icon !w-7 !h-7 opacity-0 group-hover:opacity-100 transition-opacity" :title="copyState === 'install' ? 'Copied!' : 'Copy command'" @click="copy(installCommand, 'install')">
              <span :class="copyState === 'install' ? 'i-carbon-checkmark' : 'i-carbon-copy'" class="text-[12px]" />
            </button>
          </div>

          <a :href="`kt://install/@${pkg.name}${selectedVersionTag ? `@${selectedVersionTag}` : ''}`" class="btn-primary justify-center inline-flex items-center text-center" :title="'Open in KohakuTerrarium desktop / mobile app'">
            <span class="i-carbon-arrow-right text-[14px] mr-1.5" />
            Open in app
          </a>

          <p class="text-[10px] text-warm-400 dark:text-warm-500 leading-snug">"Open in app" requires the KohakuTerrarium desktop or Android app to be installed. Otherwise, copy the command above and run it in your terminal.</p>
        </div>
      </header>

      <!-- README -->
      <section v-if="readme || readmeError" class="card p-6 mb-6">
        <div v-if="readme">
          <MarkdownRenderer :source="readme" />
        </div>
        <div v-else class="text-sm text-warm-500 dark:text-warm-400 italic">README failed to load: {{ readmeError }}</div>
      </section>

      <div v-else class="card p-6 mb-6 text-sm text-warm-500 dark:text-warm-400">Loading README…</div>

      <!-- Versions -->
      <section class="card p-6 mb-6">
        <h2 class="section-title">Versions</h2>
        <ul class="flex flex-col gap-2">
          <li v-for="v in pkg.versions || []" :key="v.tag" class="flex items-start gap-3 p-3 rounded-lg border border-warm-200/40 dark:border-warm-700/40">
            <span class="font-mono text-[13px] font-semibold text-iolite dark:text-iolite-light w-20 shrink-0">
              {{ v.tag }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-[12px] text-warm-500 dark:text-warm-400">
                <time>{{ v.released }}</time>
                <template v-if="v.framework">
                  · framework <span class="font-mono">{{ v.framework }}</span>
                </template>
                <span v-if="v.yanked" class="chip-coral ml-2">yanked</span>
              </div>
              <p v-if="v.notes" class="text-[13px] text-warm-700 dark:text-warm-300 mt-1">
                {{ v.notes }}
              </p>
              <a v-if="v.notes_url" :href="v.notes_url" target="_blank" rel="noopener noreferrer" class="text-[12px] text-iolite dark:text-iolite-light hover:underline inline-flex items-center gap-1 mt-1">
                Release notes
                <span class="i-carbon-launch text-[10px]" />
              </a>
            </div>
          </li>
        </ul>
      </section>

      <!-- Edit / discuss links -->
      <section class="flex flex-wrap gap-3 text-[12px]">
        <a :href="suggestEditUrl" target="_blank" rel="noopener noreferrer" class="btn-ghost inline-flex items-center gap-1">
          <span class="i-carbon-edit text-[12px]" />
          Suggest edit
        </a>
        <a :href="discussUrl" target="_blank" rel="noopener noreferrer" class="btn-ghost inline-flex items-center gap-1">
          <span class="i-carbon-chat text-[12px]" />
          Discuss
        </a>
        <a :href="`${pkg.repo}/issues`" target="_blank" rel="noopener noreferrer" class="btn-ghost inline-flex items-center gap-1">
          <span class="i-carbon-bug text-[12px]" />
          Report issue
        </a>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"

import MarkdownRenderer from "@/components/MarkdownRenderer.vue"
import TagBadge from "@/components/TagBadge.vue"
import { useRegistryStore } from "@/stores/registry"
import { REGISTRY_OWNER, REGISTRY_REPO, entryReadmeUrl } from "@/config"

const props = defineProps({
  name: { type: String, required: true },
})

const registry = useRegistryStore()
const router = useRouter()

const readme = ref("")
const readmeError = ref("")
const copyState = ref("")
const selectedVersionTag = ref(null)

const pkg = computed(() => registry.getByName(props.name))

const latestVersion = computed(() => pkg.value?.versions?.[0] || null)

const installableVersions = computed(() => pkg.value?.versions || [])

watch(
  pkg,
  (p) => {
    if (p && !selectedVersionTag.value) {
      // Default to latest non-yanked version.
      const first = (p.versions || []).find((v) => !v.yanked) || p.versions?.[0]
      selectedVersionTag.value = first?.tag || null
    }
  },
  { immediate: true },
)

const installCommand = computed(() => {
  if (!pkg.value) return ""
  const ver = selectedVersionTag.value
  if (ver && ver !== latestVersion.value?.tag) {
    return `kt install @${pkg.value.name}@${ver}`
  }
  return `kt install @${pkg.value.name}`
})

const frameworkConstraint = computed(() => {
  const v = pkg.value?.versions?.find((x) => x.tag === selectedVersionTag.value)
  return v?.framework || pkg.value?.framework || ""
})

const isOfficial = computed(() => (pkg.value?.tags || []).includes("official"))

const displayTags = computed(() => (pkg.value?.tags || []).filter((t) => t !== "official"))

const iconClass = computed(() => {
  const tags = pkg.value?.tags || []
  if (tags.includes("terrariums")) return "i-carbon-network-3"
  if (tags.includes("plugins")) return "i-carbon-plug"
  if (tags.includes("tools")) return "i-carbon-tools"
  if (tags.includes("creatures")) return "i-carbon-bot"
  return "i-carbon-cube"
})

const gradientClass = computed(() => {
  const tags = pkg.value?.tags || []
  if (tags.includes("terrariums")) return "from-taaffeite to-iolite"
  if (tags.includes("plugins")) return "from-aquamarine to-sapphire"
  if (tags.includes("tools")) return "from-sage to-aquamarine"
  if (tags.includes("creatures")) return "from-iolite to-taaffeite"
  return "from-warm-500 to-warm-700"
})

const suggestEditUrl = computed(() => `https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/edit/main/entries/${props.name}/entry.yaml`)

const discussUrl = computed(() => `https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/discussions/new?category=package-discussion&title=${encodeURIComponent(`Discussion: ${props.name}`)}`)

async function loadReadme() {
  if (!pkg.value) return
  readme.value = ""
  readmeError.value = ""
  try {
    const resp = await fetch(entryReadmeUrl(props.name))
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    readme.value = await resp.text()
  } catch (err) {
    readmeError.value = err?.message || String(err)
  }
}

function onTagClick(tag) {
  router.push({ name: "browse", query: { tag } })
}

async function copy(text, kind) {
  try {
    await navigator.clipboard.writeText(text)
    copyState.value = kind
    setTimeout(() => {
      if (copyState.value === kind) copyState.value = ""
    }, 1500)
  } catch {
    /* clipboard blocked — user can long-press the visible code */
  }
}

onMounted(async () => {
  if (registry.packages.length === 0) {
    await registry.fetchRegistry().catch(() => {})
  }
  await loadReadme()
})

watch(() => props.name, loadReadme)
</script>
