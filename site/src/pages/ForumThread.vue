<template>
  <div class="container-page max-w-4xl">
    <router-link :to="{ name: 'forum' }" class="text-[12px] text-warm-500 dark:text-warm-400 hover:text-iolite dark:hover:text-iolite-light inline-flex items-center gap-1 mb-4">
      <span class="i-carbon-arrow-left text-[12px]" />
      Back to Forum
    </router-link>

    <section v-if="forum.errorThread" class="card p-4 mb-6 border-coral/40">
      <div class="flex items-start gap-3">
        <span class="i-carbon-warning-alt-filled text-coral text-[18px] shrink-0 mt-0.5" />
        <div class="flex-1 text-sm text-warm-600 dark:text-warm-400">
          {{ forum.errorThread?.message || String(forum.errorThread) }}
        </div>
      </div>
    </section>

    <section v-else-if="forum.loadingThread || !thread" class="card p-6 text-sm text-warm-500 dark:text-warm-400">Loading…</section>

    <template v-else>
      <!-- Header -->
      <header class="mb-4">
        <h1 class="text-xl sm:text-2xl font-semibold text-warm-800 dark:text-warm-200 mb-2">
          {{ thread.title }}
        </h1>
        <div class="flex items-center gap-3 flex-wrap text-[12px] text-warm-500 dark:text-warm-400">
          <span class="chip-warm"> {{ thread.category?.emoji }} {{ thread.category?.name }} </span>
          <span>by {{ thread.author?.login }}</span>
          <span>·</span>
          <span>{{ formatRelative(thread.createdAt) }}</span>
          <span v-if="thread.upvoteCount > 0" class="inline-flex items-center gap-1">
            <span class="i-carbon-arrow-up text-[12px]" />
            {{ thread.upvoteCount }}
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="i-carbon-chat text-[12px]" />
            {{ thread.comments?.totalCount || 0 }}
          </span>
        </div>
      </header>

      <!-- Original post -->
      <article class="card border-l-3 border-l-iolite/50 dark:border-l-iolite-light/40 p-4 sm:p-5 mb-6">
        <div class="flex items-start gap-3">
          <img v-if="thread.author?.avatarUrl" :src="thread.author.avatarUrl" alt="" class="w-10 h-10 rounded-full shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-2 text-[13px]">
              <a :href="thread.author?.url" target="_blank" rel="noopener noreferrer" class="font-semibold text-warm-800 dark:text-warm-200 hover:text-iolite dark:hover:text-iolite-light">
                {{ thread.author?.login }}
              </a>
              <span class="chip-iolite !text-[10px] !px-1.5">OP</span>
              <span class="text-warm-400 dark:text-warm-500">
                {{ formatRelative(thread.createdAt) }}
              </span>
            </div>
            <MarkdownRenderer :source="thread.body" />
          </div>
        </div>
      </article>

      <!-- Comments -->
      <section class="mb-6">
        <h2 class="flex items-center gap-2 text-sm font-semibold text-warm-700 dark:text-warm-300 mb-3">
          <span class="i-carbon-chat text-[14px]" />
          {{ comments.length }} {{ comments.length === 1 ? "comment" : "comments" }}
        </h2>

        <div v-if="comments.length === 0" class="card p-8 flex flex-col items-center text-center gap-2">
          <span class="i-carbon-chat text-[28px] text-warm-300 dark:text-warm-600" />
          <p class="text-sm text-warm-500 dark:text-warm-400">No comments yet — be the first to reply.</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <ThreadComment v-for="c in comments" :key="c.id" :comment="c" :op-login="thread.author?.login || ''" :discussion-id="thread.id" @posted="reloadThread" />
        </div>
      </section>

      <!-- New top-level comment -->
      <section class="card p-5">
        <h3 class="section-title">
          {{ auth.signedIn ? "Add a comment" : "Sign in to comment" }}
        </h3>
        <div v-if="!auth.signedIn">
          <button class="btn-primary" @click="loginOpen = true">
            <span class="i-carbon-logo-github text-[14px] mr-1.5" />
            Sign in with GitHub
          </button>
        </div>
        <div v-else>
          <textarea v-model="newBody" class="input-field min-h-[120px] font-mono text-[13px]" placeholder="Markdown welcome." />
          <div v-if="forum.postError" class="text-coral text-[12px] mt-2">
            {{ forum.postError?.message || String(forum.postError) }}
          </div>
          <div class="flex items-center justify-end mt-3">
            <el-button size="small" type="primary" :loading="forum.posting" :disabled="newBody.trim().length < 1" @click="onPostComment"> Post comment </el-button>
          </div>
        </div>
      </section>
    </template>

    <LoginModal :open="loginOpen" @close="loginOpen = false" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"

import MarkdownRenderer from "@/components/MarkdownRenderer.vue"
import LoginModal from "@/components/LoginModal.vue"
import ThreadComment from "@/components/ThreadComment.vue"
import { useForumStore } from "@/stores/forum"
import { useAuthStore } from "@/stores/auth"
import { formatRelative } from "@/utils/time"

const props = defineProps({
  number: { type: Number, required: true },
})

const forum = useForumStore()
const auth = useAuthStore()

const newBody = ref("")
const loginOpen = ref(false)

const thread = computed(() => forum.currentThread)
const comments = computed(() => thread.value?.comments?.nodes || [])

function reloadThread() {
  return forum.loadThread(props.number)
}

onMounted(() => forum.loadThread(props.number))
watch(
  () => props.number,
  (n) => forum.loadThread(n),
)

async function onPostComment() {
  if (!thread.value?.id) return
  try {
    await forum.postReply({ discussionId: thread.value.id, body: newBody.value.trim() })
    newBody.value = ""
    await reloadThread()
  } catch {
    /* surfaced */
  }
}
</script>
