<template>
  <div class="markdown-body" v-html="rendered" />
</template>

<script setup>
import { computed } from "vue"
import { marked } from "marked"
import DOMPurify from "dompurify"

// Configure marked once at module load.
marked.use({
  gfm: true,
  breaks: false,
  pedantic: false,
})

const props = defineProps({
  source: { type: String, default: "" },
})

const rendered = computed(() => {
  if (!props.source) return ""
  const raw = marked.parse(props.source)
  // DOMPurify whitelists tags + attributes by default — strips
  // scripts, inline event handlers, javascript: URLs, etc.  Add
  // explicit ALLOWED_TAGS only if we discover something legitimately
  // missing; the default is sane.
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  })
})
</script>
