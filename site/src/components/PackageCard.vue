<template>
  <router-link
    :to="{ name: 'package', params: { name: pkg.name } }"
    class="card-hover p-4 flex flex-col gap-3 no-underline"
  >
    <div class="flex items-start gap-3">
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br"
        :class="gradientClass"
      >
        <span :class="iconClass" class="text-white text-[18px]" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="text-[15px] font-semibold text-warm-800 dark:text-warm-200 truncate">
            {{ pkg.name }}
          </h3>
          <span v-if="latestVersion" class="text-[11px] font-mono text-warm-500 dark:text-warm-400">
            {{ latestVersion.tag }}
          </span>
          <span v-if="isOfficial" class="chip-amber" :title="'Official package'">
            <span class="i-carbon-checkmark-filled text-[10px]" />
            official
          </span>
        </div>
        <div
          class="text-[11px] text-warm-500 dark:text-warm-400 mt-0.5 flex items-center gap-2 flex-wrap"
        >
          <span>{{ pkg.author }}</span>
          <span>·</span>
          <span>{{ pkg.license }}</span>
          <span v-if="latestVersion?.released">·</span>
          <span v-if="latestVersion?.released">{{ latestVersion.released }}</span>
        </div>
      </div>
    </div>

    <p
      class="text-[13px] text-warm-600 dark:text-warm-400 leading-snug line-clamp-2 min-h-[2.5rem]"
    >
      {{ pkg.description }}
    </p>

    <div class="flex flex-wrap gap-1.5">
      <TagBadge
        v-for="tag in displayTags"
        :key="tag"
        :tag="tag"
        @click.stop.prevent="$emit('tag-click', tag)"
      />
    </div>
  </router-link>
</template>

<script setup>
import { computed } from "vue"

import TagBadge from "@/components/TagBadge.vue"

const props = defineProps({
  pkg: { type: Object, required: true },
})

defineEmits(["tag-click"])

const latestVersion = computed(() => props.pkg.versions?.[0] || null)

const isOfficial = computed(() => (props.pkg.tags || []).includes("official"))

// Filter "official" out of the displayed tag chips since the
// dedicated badge already covers it.  Keep the rest in order.
const displayTags = computed(() => (props.pkg.tags || []).filter((t) => t !== "official"))

const iconClass = computed(() => {
  const tags = props.pkg.tags || []
  if (tags.includes("terrariums")) return "i-carbon-network-3"
  if (tags.includes("plugins")) return "i-carbon-plug"
  if (tags.includes("tools")) return "i-carbon-tools"
  if (tags.includes("creatures")) return "i-carbon-bot"
  return "i-carbon-cube"
})

const gradientClass = computed(() => {
  const tags = props.pkg.tags || []
  if (tags.includes("terrariums")) return "from-taaffeite to-iolite"
  if (tags.includes("plugins")) return "from-aquamarine to-sapphire"
  if (tags.includes("tools")) return "from-sage to-aquamarine"
  if (tags.includes("creatures")) return "from-iolite to-taaffeite"
  return "from-warm-500 to-warm-700"
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
