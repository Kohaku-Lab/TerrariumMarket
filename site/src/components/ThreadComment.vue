<template>
  <article :class="rootClass">
    <!-- Accepted-answer banner (only meaningful on top-level comments) -->
    <div v-if="depth === 0 && comment.isAnswer" class="flex items-center gap-1.5 px-4 py-1.5 bg-aquamarine/10 text-aquamarine text-[11px] font-medium">
      <span class="i-carbon-checkmark-filled text-[11px]" />
      Marked as answer
    </div>

    <div :class="depth === 0 ? 'p-4 sm:p-5' : ''">
      <div class="flex items-start gap-2.5">
        <img v-if="comment.author?.avatarUrl" :src="comment.author.avatarUrl" alt="" class="rounded-full shrink-0 mt-0.5" :class="depth === 0 ? 'w-8 h-8' : 'w-5 h-5'" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1 text-[12px]" :class="{ 'sm:text-[13px] mb-1.5': depth === 0 }">
            <a :href="comment.author?.url" target="_blank" rel="noopener noreferrer" class="font-semibold text-warm-800 dark:text-warm-200 hover:text-iolite dark:hover:text-iolite-light">
              {{ comment.author?.login }}
            </a>
            <span v-if="isOP" class="chip-iolite !text-[10px] !px-1.5">OP</span>
            <span class="text-warm-400 dark:text-warm-500">
              {{ formatRelative(comment.createdAt) }}
            </span>
            <span v-if="comment.upvoteCount > 0" class="ml-auto inline-flex items-center gap-1 text-warm-400 dark:text-warm-500" title="Upvotes">
              <span class="i-carbon-arrow-up text-[11px]" />
              {{ comment.upvoteCount }}
            </span>
          </div>
          <MarkdownRenderer :source="comment.body" />
        </div>
      </div>

      <!-- Nested replies — recursive, so arbitrarily deep data renders
           correctly.  GitHub Discussions currently flattens everything
           to comment → replies (a reply-to-a-reply lands in the same
           list with an @mention), but the renderer doesn't rely on
           that: each level gets its own rail; the indent stops growing
           past depth 3 so deep chains stay readable on phones. -->
      <div v-if="children.length" class="relative mt-3" :class="indentClass">
        <div class="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-iolite/35 to-iolite/5 dark:from-iolite-light/30 dark:to-transparent" aria-hidden="true" />
        <div class="pl-3 sm:pl-4 flex flex-col gap-2">
          <div v-if="depth === 0" class="text-[11px] font-medium uppercase tracking-wide text-warm-400 dark:text-warm-500">{{ children.length }} {{ children.length === 1 ? "reply" : "replies" }}</div>
          <ThreadComment v-for="child in children" :key="child.id" :comment="child" :depth="depth + 1" :op-login="opLogin" :discussion-id="discussionId" :reply-anchor-id="anchorId" @posted="$emit('posted')" />
        </div>
      </div>

      <!-- Reply action -->
      <div v-if="auth.signedIn" class="mt-2" :class="{ 'sm:ml-11 mt-3': depth === 0 }">
        <button class="btn-ghost !text-[11px] !py-1" @click="replyOpen = !replyOpen">
          <span class="i-carbon-reply text-[11px] mr-1" />
          {{ replyOpen ? "Cancel reply" : "Reply" }}
        </button>

        <div v-if="replyOpen" class="mt-2 p-3 border border-warm-200 dark:border-warm-700 rounded-lg bg-warm-50/50 dark:bg-warm-950/30">
          <textarea v-model="body" class="input-field min-h-[100px] font-mono text-[13px]" :placeholder="`Reply to ${comment.author?.login || 'this comment'}…`" />
          <p v-if="depth > 0" class="text-[11px] text-warm-400 dark:text-warm-500 mt-1.5">GitHub nests replies one level — this posts to the same thread and mentions @{{ comment.author?.login }} for context.</p>
          <div v-if="forum.postError" class="text-coral text-[12px] mt-1.5">
            {{ forum.postError?.message || String(forum.postError) }}
          </div>
          <div class="flex items-center justify-end gap-2 mt-2">
            <el-button size="small" @click="replyOpen = false">Cancel</el-button>
            <el-button size="small" type="primary" :loading="forum.posting" :disabled="body.trim().length < 1" @click="submit"> Post reply </el-button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from "vue"

import MarkdownRenderer from "@/components/MarkdownRenderer.vue"
import ThreadComment from "@/components/ThreadComment.vue"
import { useForumStore } from "@/stores/forum"
import { useAuthStore } from "@/stores/auth"
import { formatRelative } from "@/utils/time"

const props = defineProps({
  comment: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  opLogin: { type: String, default: "" },
  discussionId: { type: String, required: true },
  // Top-level comment id this subtree belongs to.  The GitHub API only
  // accepts top-level comment ids as replyToId, so every reply in the
  // subtree anchors there regardless of visual depth.
  replyAnchorId: { type: String, default: "" },
})

const emit = defineEmits(["posted"])

const forum = useForumStore()
const auth = useAuthStore()

const replyOpen = ref(false)
const body = ref("")

const children = computed(() => props.comment.replies?.nodes || [])
const anchorId = computed(() => (props.depth === 0 ? props.comment.id : props.replyAnchorId))
const isOP = computed(() => Boolean(props.comment.author?.login) && props.comment.author.login === props.opLogin)

const rootClass = computed(() => {
  if (props.depth === 0) {
    return ["card overflow-hidden", props.comment.isAnswer ? "!border-aquamarine/50" : ""]
  }
  return "rounded-lg bg-warm-50 dark:bg-warm-950/50 border border-warm-200/60 dark:border-warm-700/40 px-3 py-2.5"
})

const indentClass = computed(() => {
  if (props.depth === 0) return "ml-4 sm:ml-11"
  if (props.depth < 3) return "ml-2 sm:ml-4"
  return ""
})

async function submit() {
  const text = body.value.trim()
  if (!text) return
  // Replying to a reply: mirror GitHub's own convention — post to the
  // top-level thread, lead with a mention of who you're answering.
  const mention = props.depth > 0 && props.comment.author?.login ? `@${props.comment.author.login} ` : ""
  try {
    await forum.postReply({
      discussionId: props.discussionId,
      body: mention + text,
      replyToId: anchorId.value,
    })
    body.value = ""
    replyOpen.value = false
    emit("posted")
  } catch {
    /* surfaced via forum.postError inside the open reply box */
  }
}
</script>
