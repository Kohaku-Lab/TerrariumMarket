<template>
  <div class="container-page">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-warm-800 dark:text-warm-200 mb-2">Submit a package</h1>
      <p class="text-sm text-warm-500 dark:text-warm-400 max-w-2xl">Fill the form below and we'll open a pre-filled GitHub editor in a new tab. GitHub handles the rest — login, forking, branching, opening the PR. A maintainer reviews + merges; the on-merge workflow rebuilds the index and Cloudflare Pages auto-deploys within a minute.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form -->
      <section class="card p-6 lg:col-span-2 flex flex-col gap-4">
        <FieldRow label="Package name" hint="3–40 chars; lowercase letters, digits, `-`, `_`. Becomes the install id (kt install @<name>).">
          <input v-model="form.name" type="text" class="input-field font-mono" placeholder="my-creature-pack" :class="{ '!border-coral': errors.name }" />
        </FieldRow>

        <FieldRow label="GitHub repo" hint="Public HTTPS URL to a repo with a kohaku.yaml at its root.">
          <input v-model="form.repo" type="url" class="input-field font-mono" placeholder="https://github.com/your-name/my-creature-pack" :class="{ '!border-coral': errors.repo }" />
        </FieldRow>

        <FieldRow label="One-line description" hint="≤ 200 chars; plain text; shown on the browse card.">
          <input v-model="form.description" type="text" maxlength="200" class="input-field" placeholder="A focused creature for code-review sessions" />
        </FieldRow>

        <FieldRow label="Tags" hint="Comma-separated. Must include at least one of: creatures, terrariums, plugins, tools.">
          <input v-model="tagsString" type="text" class="input-field" placeholder="creatures, examples" :class="{ '!border-coral': errors.tags }" />
        </FieldRow>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Author (GitHub username)">
            <input v-model="form.author" type="text" class="input-field font-mono" placeholder="your-github-handle" />
          </FieldRow>

          <FieldRow label="License (SPDX)" hint="e.g. MIT, Apache-2.0, GPL-3.0-only.">
            <input v-model="form.license" type="text" class="input-field font-mono" placeholder="MIT" />
          </FieldRow>
        </div>

        <FieldRow label="Homepage (optional)">
          <input v-model="form.homepage" type="url" class="input-field" placeholder="https://example.com" />
        </FieldRow>

        <FieldRow label="Framework constraint" hint="PEP 440 / semver-style. Defaults to >=1.5.0,<2.0.0.">
          <input v-model="form.framework" type="text" class="input-field font-mono" placeholder=">=1.5.0,<2.0.0" />
        </FieldRow>

        <div class="border-t border-warm-200 dark:border-warm-700 pt-4">
          <h2 class="text-[12px] uppercase tracking-wider text-warm-500 dark:text-warm-400 mb-3">First version</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow label="Version tag">
              <input v-model="form.versionTag" type="text" class="input-field font-mono" placeholder="v0.1.0" />
            </FieldRow>

            <FieldRow label="Released">
              <input v-model="form.versionDate" type="date" class="input-field" />
            </FieldRow>
          </div>

          <FieldRow label="Release notes (optional)">
            <textarea v-model="form.versionNotes" class="input-field min-h-[80px]" placeholder="What's new?" />
          </FieldRow>
        </div>

        <div v-if="formError" class="text-coral text-[13px]">
          {{ formError }}
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <router-link :to="{ name: 'browse' }" class="btn-ghost"> Cancel </router-link>
          <button type="button" class="btn-primary inline-flex items-center" :disabled="!canSubmit" @click="onSubmit">
            <span class="i-carbon-logo-github text-[14px] mr-1.5" />
            Open PR on GitHub
          </button>
        </div>
      </section>

      <!-- Preview / help column -->
      <aside class="flex flex-col gap-4">
        <section class="card p-4">
          <h3 class="text-[12px] uppercase tracking-wider text-warm-500 dark:text-warm-400 mb-2">entry.yaml preview</h3>
          <pre class="font-mono text-[11px] leading-snug text-warm-700 dark:text-warm-300 whitespace-pre-wrap break-all overflow-auto max-h-[400px]">{{ yamlPreview || "// fill the form to preview…" }}</pre>
        </section>

        <section class="card p-4 text-[12px] text-warm-600 dark:text-warm-400 leading-relaxed">
          <h3 class="text-[12px] uppercase tracking-wider text-warm-500 dark:text-warm-400 mb-2">Before submitting</h3>
          <ul class="space-y-2 list-disc pl-4">
            <li>Make sure your repo's <code>kohaku.yaml</code> declares the same <code>name</code>.</li>
            <li>Push and tag a git tag matching <em>Version tag</em> above.</li>
            <li>The PR CI validates the schema, SPDX licence, and that the tag exists in your source repo. Errors will show up on the PR.</li>
            <li>You don't need to fill in the commit hash — CI resolves it from the tag.</li>
          </ul>
        </section>
      </aside>
    </div>

    <LoginModal :open="loginOpen" @close="loginOpen = false" />
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { h } from "vue"

import LoginModal from "@/components/LoginModal.vue"
import { useAuthStore } from "@/stores/auth"
import { REGISTRY_OWNER, REGISTRY_REPO, REGISTRY_BRANCH } from "@/config"
import { buildEntryYaml, buildGitHubEditorUrl } from "@/utils/yamlBuilder"

const auth = useAuthStore()

const loginOpen = ref(false)
const formError = ref("")

const form = ref({
  name: "",
  repo: "",
  description: "",
  author: auth.user?.login || "",
  license: "MIT",
  homepage: "",
  framework: ">=1.5.0,<2.0.0",
  versionTag: "v0.1.0",
  versionDate: new Date().toISOString().slice(0, 10),
  versionNotes: "",
})

const tagsString = ref("")

// Validation
const errors = computed(() => ({
  name: !/^[a-z][a-z0-9_-]{1,38}[a-z0-9]$/.test(form.value.name),
  repo: !/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(form.value.repo.trim()),
  tags: parsedTags.value.length === 0,
}))

const parsedTags = computed(() =>
  tagsString.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
)

const canSubmit = computed(() => {
  if (!form.value.name || !form.value.repo) return false
  if (errors.value.name || errors.value.repo || errors.value.tags) return false
  if (!form.value.description.trim()) return false
  if (!form.value.author.trim()) return false
  if (!form.value.license.trim()) return false
  if (!form.value.versionTag.trim()) return false
  return true
})

const yamlPreview = computed(() => {
  try {
    return buildEntryYaml({ ...form.value, tags: parsedTags.value })
  } catch {
    return ""
  }
})

function onSubmit() {
  if (!canSubmit.value) {
    formError.value = "Please fix the highlighted fields before submitting."
    return
  }
  formError.value = ""
  const yaml = buildEntryYaml({ ...form.value, tags: parsedTags.value })
  const filename = `entries/${form.value.name.trim()}/entry.yaml`
  const url = buildGitHubEditorUrl({
    owner: REGISTRY_OWNER,
    repo: REGISTRY_REPO,
    branch: REGISTRY_BRANCH,
    filename,
    content: yaml,
    message: `Add ${form.value.name.trim()}`,
  })

  // Open in a new tab — GitHub handles the rest.
  window.open(url, "_blank", "noopener,noreferrer")
}

// Simple field-row presentation — local to this page since no
// other page needs the exact same label + hint shape.
const FieldRow = (props, { slots }) => h("label", { class: "flex flex-col gap-1.5" }, [h("div", { class: "text-[12px] font-medium text-warm-600 dark:text-warm-400" }, props.label), slots.default?.(), props.hint ? h("div", { class: "text-[11px] text-warm-400 dark:text-warm-500 leading-snug" }, props.hint) : null])
FieldRow.props = ["label", "hint"]
</script>
