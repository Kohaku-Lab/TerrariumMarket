<template>
  <div class="container-page">
    <header class="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-warm-800 dark:text-warm-200 mb-1">Forum</h1>
        <p class="text-[13px] text-warm-500 dark:text-warm-400">
          Backed by
          <a
            :href="`https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/discussions`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-iolite dark:text-iolite-light hover:underline"
            >GitHub Discussions</a
          >
          on the registry repo. Reading is open to everyone; posting requires a GitHub sign-in.
        </p>
      </div>

      <button class="btn-primary inline-flex items-center" @click="onNewThread">
        <span class="i-carbon-add text-[14px] mr-1.5" />
        New thread
      </button>
    </header>

    <!-- Category filter -->
    <section v-if="forum.categories.length > 0" class="flex flex-wrap gap-2 mb-5">
      <button
        type="button"
        class="chip"
        :class="
          !selectedCategoryId ? 'chip-iolite' : 'chip-warm hover:bg-warm-200 dark:hover:bg-warm-700'
        "
        @click="selectedCategoryId = null"
      >
        All
      </button>
      <button
        v-for="cat in forum.categories"
        :key="cat.id"
        type="button"
        class="chip"
        :class="
          selectedCategoryId === cat.id
            ? 'chip-iolite'
            : 'chip-warm hover:bg-warm-200 dark:hover:bg-warm-700'
        "
        @click="selectedCategoryId = cat.id"
      >
        <span v-if="cat.emoji">{{ cat.emoji }}</span>
        {{ cat.name }}
      </button>
    </section>

    <!-- Error -->
    <section v-if="forum.errorList" class="card p-4 mb-6 border-coral/40">
      <div class="flex items-start gap-3">
        <span class="i-carbon-warning-alt-filled text-coral text-[18px] shrink-0 mt-0.5" />
        <div class="flex-1 text-sm">
          <div class="font-medium text-coral mb-1">Could not load forum</div>
          <div class="text-warm-600 dark:text-warm-400 break-words">
            {{ forum.errorList?.message || String(forum.errorList) }}
          </div>
          <p class="text-[12px] text-warm-500 mt-2">
            If you're seeing rate-limit errors,
            <button
              class="text-iolite dark:text-iolite-light hover:underline"
              @click="loginOpen = true"
            >
              sign in
            </button>
            to raise your limit.
          </p>
        </div>
      </div>
    </section>

    <!-- Loading skeleton -->
    <section v-if="forum.loadingList && forum.threads.length === 0" class="flex flex-col gap-2">
      <div v-for="i in 5" :key="i" class="card p-4 flex items-center gap-3 animate-pulse">
        <div class="w-10 h-10 rounded-full bg-warm-200 dark:bg-warm-800" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-3/4 bg-warm-200 dark:bg-warm-800 rounded" />
          <div class="h-3 w-1/3 bg-warm-200 dark:bg-warm-800 rounded" />
        </div>
      </div>
    </section>

    <!-- Empty -->
    <section
      v-else-if="forum.threads.length === 0"
      class="card p-12 flex flex-col items-center text-center gap-3"
    >
      <span class="i-carbon-chat text-[40px] text-warm-400 dark:text-warm-600" />
      <h3 class="text-base font-semibold text-warm-700 dark:text-warm-300">No threads yet</h3>
      <p class="text-sm text-warm-500 dark:text-warm-400">Be the first to start a discussion.</p>
      <button class="btn-primary mt-2" @click="onNewThread">
        <span class="i-carbon-add text-[14px] mr-1.5" />
        New thread
      </button>
    </section>

    <!-- Thread list -->
    <section v-else class="flex flex-col gap-2">
      <router-link
        v-for="t in forum.threads"
        :key="t.id"
        :to="{ name: 'forum-thread', params: { number: t.number } }"
        class="card-hover p-4 flex items-start gap-3 no-underline"
      >
        <img
          v-if="t.author?.avatarUrl"
          :src="t.author.avatarUrl"
          alt=""
          class="w-9 h-9 rounded-full shrink-0"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-medium text-warm-800 dark:text-warm-200 truncate">
              {{ t.title }}
            </h3>
            <span class="chip-warm"> {{ t.category?.emoji }} {{ t.category?.name }} </span>
          </div>
          <div
            class="text-[12px] text-warm-500 dark:text-warm-400 mt-1 flex items-center gap-3 flex-wrap"
          >
            <span>by {{ t.author?.login || "unknown" }}</span>
            <span>·</span>
            <span>{{ formatRelative(t.updatedAt) }}</span>
            <span v-if="t.comments?.totalCount">·</span>
            <span v-if="t.comments?.totalCount" class="inline-flex items-center gap-1">
              <span class="i-carbon-chat text-[12px]" />
              {{ t.comments.totalCount }}
            </span>
            <span v-if="t.upvoteCount > 0">·</span>
            <span v-if="t.upvoteCount > 0" class="inline-flex items-center gap-1">
              <span class="i-carbon-arrow-up text-[12px]" />
              {{ t.upvoteCount }}
            </span>
          </div>
        </div>
      </router-link>

      <button
        v-if="forum.pageInfo?.hasNextPage"
        class="btn-secondary mt-2 mx-auto !py-1.5"
        :disabled="forum.loadingList"
        @click="loadMore"
      >
        Load more
      </button>
    </section>

    <!-- New thread modal -->
    <el-dialog
      v-model="newOpen"
      title="New thread"
      width="640px"
      align-center
      :close-on-click-modal="false"
    >
      <div v-if="!auth.signedIn" class="text-sm text-warm-600 dark:text-warm-400 mb-4">
        Sign in with GitHub to post.
      </div>
      <div v-else class="flex flex-col gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-[12px] font-medium text-warm-600 dark:text-warm-400"> Category </span>
          <select v-model="newForm.categoryId" class="input-field cursor-pointer">
            <option v-for="c in forum.categories" :key="c.id" :value="c.id">
              {{ c.emoji }} {{ c.name }}
            </option>
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[12px] font-medium text-warm-600 dark:text-warm-400">Title</span>
          <input v-model="newForm.title" type="text" class="input-field" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[12px] font-medium text-warm-600 dark:text-warm-400">
            Body (markdown)
          </span>
          <textarea
            v-model="newForm.body"
            class="input-field min-h-[160px] font-mono text-[13px]"
            placeholder="Use markdown — links, code, lists all welcome."
          />
        </label>
        <div v-if="forum.postError" class="text-coral text-[12px]">
          {{ forum.postError?.message || String(forum.postError) }}
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="newOpen = false">Cancel</el-button>
        <el-button
          v-if="!auth.signedIn"
          size="small"
          type="primary"
          @click="
            () => {
              newOpen = false
              loginOpen = true
            }
          "
        >
          Sign in
        </el-button>
        <el-button
          v-else
          size="small"
          type="primary"
          :loading="forum.posting"
          :disabled="!canPost"
          @click="onPostNewThread"
        >
          Post
        </el-button>
      </template>
    </el-dialog>

    <LoginModal :open="loginOpen" @close="loginOpen = false" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"

import LoginModal from "@/components/LoginModal.vue"
import { useForumStore } from "@/stores/forum"
import { useAuthStore } from "@/stores/auth"
import { REGISTRY_OWNER, REGISTRY_REPO } from "@/config"

const forum = useForumStore()
const auth = useAuthStore()
const router = useRouter()

const selectedCategoryId = ref(null)
const newOpen = ref(false)
const loginOpen = ref(false)
const newForm = ref({ categoryId: "", title: "", body: "" })

const canPost = computed(
  () =>
    newForm.value.categoryId &&
    newForm.value.title.trim().length >= 3 &&
    newForm.value.body.trim().length >= 10,
)

onMounted(async () => {
  await forum.loadCategories()
  await forum.loadThreads({ categoryId: null, reset: true })
  // Default the new-thread category to the first one (typically "General").
  if (forum.categories[0] && !newForm.value.categoryId) {
    newForm.value.categoryId = forum.categories[0].id
  }
})

watch(selectedCategoryId, async (id) => {
  await forum.loadThreads({ categoryId: id, reset: true })
})

async function loadMore() {
  await forum.loadThreads({ categoryId: selectedCategoryId.value, reset: false })
}

function onNewThread() {
  if (!auth.signedIn) {
    loginOpen.value = true
    return
  }
  newOpen.value = true
}

async function onPostNewThread() {
  try {
    const number = await forum.postNewThread({
      categoryId: newForm.value.categoryId,
      title: newForm.value.title.trim(),
      body: newForm.value.body.trim(),
    })
    newOpen.value = false
    newForm.value = { categoryId: forum.categories[0]?.id || "", title: "", body: "" }
    router.push({ name: "forum-thread", params: { number } })
  } catch {
    /* error surfaced via forum.postError */
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
