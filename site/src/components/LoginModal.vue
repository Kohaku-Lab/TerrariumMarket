<template>
  <el-dialog v-model="visible" title="Sign in with GitHub" width="520px" align-center :close-on-click-modal="false" :show-close="canClose" @close="onClose">
    <!-- starting / no code yet -->
    <div v-if="phase === 'requesting_code'" class="flex flex-col items-center gap-3 py-6 text-[13px] text-warm-500 dark:text-warm-400">
      <span class="i-carbon-renew text-2xl text-iolite kohaku-pulse" />
      <span>Requesting device code…</span>
    </div>

    <!-- device code state -->
    <div v-else-if="userCode" class="flex flex-col gap-4 text-[13px]">
      <section class="flex flex-col gap-1.5">
        <p class="text-warm-700 dark:text-warm-300 font-medium">1. Open this URL in any browser:</p>
        <div class="flex items-center gap-2 rounded-lg bg-iolite/6 dark:bg-iolite/8 border border-iolite/15 dark:border-iolite/20 px-2.5 py-1.5">
          <span class="i-carbon-link text-iolite dark:text-iolite-light shrink-0" />
          <code class="flex-1 font-mono text-[12px] text-warm-700 dark:text-warm-300 truncate select-all">
            {{ verificationUri }}
          </code>
          <el-button size="small" @click="copy(verificationUri, 'url')">
            <span class="i-carbon-copy text-[11px] mr-1" />
            {{ copyState === "url" ? "Copied!" : "Copy" }}
          </el-button>
          <el-button size="small" type="primary" plain @click="openExternally(verificationUri)">
            <span class="i-carbon-launch text-[11px] mr-1" />
            Open
          </el-button>
        </div>
        <p class="text-[11px] text-warm-400 dark:text-warm-500">Use this device, your phone, or any device with a browser.</p>
      </section>

      <section class="flex flex-col gap-1.5">
        <p class="text-warm-700 dark:text-warm-300 font-medium">2. Enter this code on that page:</p>
        <div class="flex items-center gap-2 rounded-lg bg-iolite/6 dark:bg-iolite/8 border border-iolite/15 dark:border-iolite/20 px-3 py-2">
          <code class="flex-1 font-mono text-xl tracking-[0.18em] font-bold text-iolite dark:text-iolite-light text-center select-all">
            {{ userCode }}
          </code>
          <el-button size="small" @click="copy(userCode, 'code')">
            <span class="i-carbon-copy text-[11px] mr-1" />
            {{ copyState === "code" ? "Copied!" : "Copy" }}
          </el-button>
        </div>
      </section>

      <section class="flex items-center gap-2 text-[12px] text-warm-500 dark:text-warm-400">
        <span class="i-carbon-time text-warm-400 shrink-0" />
        <span>3. Once you authorise, this dialog closes automatically.</span>
      </section>

      <p v-if="auth.expiresIn > 0" class="text-[11px] text-warm-400 dark:text-warm-500 italic">The code expires in ~{{ Math.round(auth.expiresIn / 60) }} min — finish before then.</p>
    </div>

    <!-- success -->
    <div v-if="phase === 'ready'" class="flex items-center gap-2 py-2 text-[13px] text-aquamarine font-medium">
      <span class="i-carbon-checkmark-filled text-lg" />
      <span>Signed in as {{ auth.user?.login }}. Closing…</span>
    </div>

    <!-- error -->
    <div v-if="phase === 'error'" class="flex items-start gap-2 py-2 text-[13px] text-coral">
      <span class="i-carbon-warning-alt-filled text-lg shrink-0 mt-0.5" />
      <span class="font-mono text-[12px] break-words">{{ auth.errorMessage }}</span>
    </div>

    <template #footer>
      <el-button v-if="phase === 'error'" size="small" type="primary" @click="auth.start()">
        <span class="i-carbon-renew text-[11px] mr-1" />
        Try again
      </el-button>
      <el-button size="small" @click="onClose">
        {{ phase === "ready" ? "Close" : "Cancel" }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue"

import { useAuthStore } from "@/stores/auth"

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(["close", "done"])

const auth = useAuthStore()

const copyState = ref("")

const visible = computed({
  get: () => props.open,
  set: (v) => {
    if (!v) onClose()
  },
})

const phase = computed(() => auth.phase)
const userCode = computed(() => auth.userCode)
const verificationUri = computed(() => auth.verificationUri)

const canClose = computed(() => phase.value !== "awaiting_user" || Boolean(userCode.value))

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && (phase.value === "idle" || phase.value === "error")) {
      auth.start()
    }
  },
  { immediate: true },
)

watch(
  () => auth.phase,
  (p) => {
    if (p === "ready") {
      emit("done")
      // Brief moment so the user sees the success state.
      setTimeout(() => emit("close"), 1000)
    }
  },
)

function onClose() {
  auth.cancel()
  emit("close")
}

async function copy(text, kind) {
  try {
    await navigator.clipboard.writeText(text)
    copyState.value = kind
    setTimeout(() => {
      if (copyState.value === kind) copyState.value = ""
    }, 1500)
  } catch {
    /* noop */
  }
}

function openExternally(url) {
  if (!url) return
  try {
    window.open(url, "_blank", "noopener,noreferrer")
  } catch {
    /* noop */
  }
}
</script>
