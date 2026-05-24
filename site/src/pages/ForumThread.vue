<template>
  <div class="container-page max-w-4xl">
    <router-link
      :to="{ name: 'forum' }"
      class="text-[12px] text-warm-500 dark:text-warm-400 hover:text-iolite dark:hover:text-iolite-light inline-flex items-center gap-1 mb-4"
    >
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

    <section
      v-else-if="forum.loadingThread || !thread"
      class="card p-6 text-sm text-warm-500 dark:text-warm-400"
    >
      Loading…
    </section>

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
        </div>
      </header>

      <!-- Original post -->
      <article class="card p-5 mb-4">
        <div class="flex items-start gap-3">
          <img
            v-if="thread.author?.avatarUrl"
            :src="thread.author.avatarUrl"
            alt=""
            class="w-10 h-10 rounded-full shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2 text-[13px]">
              <a
                :href="thread.author?.url"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-warm-800 dark:text-warm-200 hover:text-iolite dark:hover:text-iolite-light"
              >
                {{ thread.author?.login }}
              </a>
              <span class="text-warm-500 dark:text-warm-400">
                {{ formatRelative(thread.createdAt) }}
              </span>
            </div>
            <MarkdownRenderer :source="thread.body" />
          </div>
        </div>
      </article>

      <!-- Comments -->
      <section class="flex flex-col gap-3 mb-6">
        <article
          v-for="c in thread.comments?.nodes || []"
          :key="c.id"
          class="card p-5"
          :class="{ '!border-aquamarine/40': c.isAnswer }"
        >
          <div class="flex items-start gap-3">
            <img
              v-if="c.author?.avatarUrl"
              :src="c.author.avatarUrl"
              alt=""
              class="w-9 h-9 rounded-full shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 text-[13px]">
                <a
                  :href="c.author?.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium text-warm-800 dark:text-warm-200 hover:text-iolite dark:hover:text-iolite-light"
                >
                  {{ c.author?.login }}
                </a>
                <span class="text-warm-500 dark:text-warm-400">
                  {{ formatRelative(c.createdAt) }}
                </span>
                <span v-if="c.isAnswer" class="chip-sage">
                  <span class="i-carbon-checkmark-filled text-[10px]" />
                  Answer
                </span>
              </div>
              <MarkdownRenderer :source="c.body" />

              <!-- Nested replies -->
              <div
                v-if="c.replies?.nodes?.length"
                class="mt-4 pt-4 border-t border-warm-200 dark:border-warm-700 flex flex-col gap-4"
              >
                <div v-for="r in c.replies.nodes" :key="r.id" class="flex items-start gap-2">
                  <img
                    v-if="r.author?.avatarUrl"
                    :src="r.author.avatarUrl"
                    alt=""
                    class="w-7 h-7 rounded-full shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 text-[12px]">
                      <a
                        :href="r.author?.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-medium text-warm-700 dark:text-warm-300 hover:text-iolite dark:hover:text-iolite-light"
                      >
                        {{ r.author?.login }}
                      </a>
                      <span class="text-warm-500 dark:text-warm-400">
                        {{ formatRelative(r.createdAt) }}
                      </span>
                    </div>
                    <MarkdownRenderer :source="r.body" />
                  </div>
                </div>
              </div>

              <button
                v-if="auth.signedIn"
                class="btn-ghost !text-[11px] mt-3"
                @click="replyParentId = replyParentId === c.id ? null : c.id"
              >
                <span class="i-carbon-reply text-[11px] mr-1" />
                {{ replyParentId === c.id ? "Cancel reply" : "Reply" }}
              </button>

              <div
                v-if="replyParentId === c.id"
                class="mt-3 p-3 border border-warm-200 dark:border-warm-700 rounded-lg"
              >
                <textarea
                  v-model="replyBody"
                  class="input-field min-h-[100px] font-mono text-[13px]"
                  :placeholder="`Reply to ${c.author?.login}…`"
                />
                <div class="flex items-center justify-end gap-2 mt-2">
                  <el-button size="small" @click="replyParentId = null">Cancel</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    :loading="forum.posting"
                    :disabled="replyBody.trim().length < 1"
                    @click="onPostReply(c.id)"
                  >
                    Post reply
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </article>
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
          <textarea
            v-model="newBody"
            class="input-field min-h-[120px] font-mono text-[13px]"
            placeholder="Markdown welcome."
          />
          <div v-if="forum.postError" class="text-coral text-[12px] mt-2">
            {{ forum.postError?.message || String(forum.postError) }}
          </div>
          <div class="flex items-center justify-end mt-3">
            <el-button
              size="small"
              type="primary"
              :loading="forum.posting"
              :disabled="newBody.trim().length < 1"
              @click="onPostComment"
            >
              Post comment
            </el-button>
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
import { useForumStore } from "@/stores/forum"
import { useAuthStore } from "@/stores/auth"

const props = defineProps({
  number: { type: Number, required: true },
})

const forum = useForumStore()
const auth = useAuthStore()

const newBody = ref("")
const replyBody = ref("")
const replyParentId = ref(null)
const loginOpen = ref(false)

const thread = computed(() => forum.currentThread)

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
    await forum.loadThread(props.number)
  } catch {
    /* surfaced */
  }
}

async function onPostReply(parentId) {
  if (!thread.value?.id || !replyBody.value.trim()) return
  try {
    await forum.postReply({
      discussionId: thread.value.id,
      body: replyBody.value.trim(),
      replyToId: parentId,
    })
    replyBody.value = ""
    replyParentId.value = null
    await forum.loadThread(props.number)
  } catch {
    /* surfaced */
  }
}

function formatRelative(iso) {
  if (!iso) return ""
  try {
    const date = new Date(iso)
    const diff = (Date.now() - date.getTime()) / 1000
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.round(diff / 60)} min ago`
    if (diff < 86400) return `${Math.round(diff / 3600)} h ago`
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return iso
  }
}
</script>
