<template>
  <!--
    Brand mark — gradient backdrop with the bubble-tea Kohaku
    portrait overlaid.  Identical pattern to the framework
    frontend's components/shell/BrandMark.vue so the two apps
    feel like the same family.

    The image fallback to the gradient happens when the asset
    can't be loaded (e.g. older browsers, jsdom in tests).
  -->
  <div class="relative overflow-hidden bg-gradient-to-br from-amber via-iolite-light to-iolite">
    <img v-if="showImg" :src="iconSrc" alt="Kohaku" class="absolute inset-0 w-full h-full object-cover" @error="onError" />
  </div>
</template>

<script setup>
import { ref } from "vue"

const showImg = ref(true)
const iconSrc = "/kohaku-icon.png"

function onError() {
  showImg.value = false
}

if (typeof window === "undefined" || window.location.protocol === "file:") {
  showImg.value = false
}
</script>
