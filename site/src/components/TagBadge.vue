<template>
  <button
    type="button"
    :class="['gem-badge', chipClass, 'cursor-pointer transition-all hover:scale-[1.02]']"
    @click="$emit('click', tag)"
  >
    {{ tag }}
  </button>
</template>

<script setup>
import { computed } from "vue"

import { TAG_COLOR } from "@/config"

const props = defineProps({
  tag: { type: String, required: true },
})

defineEmits(["click"])

const chipClass = computed(() => {
  const color = TAG_COLOR[props.tag] || "warm"
  return `chip-${color}`
})
</script>
