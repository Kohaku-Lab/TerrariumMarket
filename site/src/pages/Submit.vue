<template>
  <div class="container-page">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-warm-800 dark:text-warm-200 mb-2">Submit a package</h1>
      <p class="text-sm text-warm-500 dark:text-warm-400 max-w-2xl">Paste your repo URL — we'll read its <code class="font-mono text-warm-700 dark:text-warm-300">kohaku.yaml</code> manifest and pre-fill the rest. Submit opens a GitHub editor in a new tab; GitHub handles login, forking, branching, and PR creation. A maintainer reviews + merges; the on-merge workflow rebuilds the index and Cloudflare Pages auto-deploys.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form -->
      <section class="card p-6 lg:col-span-2 flex flex-col gap-4">
        <!-- Repo URL + Verify action — first input, drives autofill -->
        <FieldRow label="GitHub repo" hint="Public HTTPS URL to a repo with a kohaku.yaml at its root.">
          <div class="flex gap-2">
            <input v-model="form.repo" type="url" class="input-field font-mono flex-1" placeholder="https://github.com/your-name/my-package" :class="{ '!border-coral': errors.repo, '!border-aquamarine/60': probe.ok }" @input="probe.reset()" @blur="probe.run()" />
            <button type="button" class="btn-secondary !py-2" :disabled="probe.loading || !form.repo.trim()" @click="probe.run()">
              <span class="i-carbon-search text-[12px] mr-1" :class="{ 'kohaku-pulse': probe.loading }" />
              {{ probe.loading ? "Verifying…" : probe.ok ? "Re-verify" : "Verify" }}
            </button>
          </div>
        </FieldRow>

        <!-- Probe status banner -->
        <div v-if="probe.ok" class="flex items-start gap-2 p-2.5 rounded-lg bg-aquamarine/8 border border-aquamarine/25 text-[12px] text-warm-700 dark:text-warm-300">
          <span class="i-carbon-checkmark-filled text-aquamarine text-[14px] shrink-0 mt-0.5" />
          <div class="flex-1">
            Found <code class="font-mono">{{ probe.result.manifestPath }}</code> on <code class="font-mono">{{ probe.result.branch }}</code> — autofilled <strong>{{ probe.filledFieldsLabel }}</strong
            >. Adjust below if needed.
          </div>
        </div>
        <div v-else-if="probe.error" class="flex items-start gap-2 p-2.5 rounded-lg bg-coral/8 border border-coral/25 text-[12px] text-warm-700 dark:text-warm-300">
          <span class="i-carbon-warning-alt-filled text-coral text-[14px] shrink-0 mt-0.5" />
          <div class="flex-1">
            <div class="font-medium text-coral mb-0.5">Could not read manifest</div>
            <div class="text-warm-600 dark:text-warm-400">{{ probe.error.message }}</div>
          </div>
        </div>

        <FieldRow label="Package name" hint="3–40 chars; lowercase letters, digits, `-`, `_`. Becomes the install id (kt install @<name>).">
          <input v-model="form.name" type="text" class="input-field font-mono" placeholder="my-creature-pack" :class="{ '!border-coral': errors.name }" />
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
            <FieldRow label="Version tag" hint="Auto-filled from the latest git tag, or `main` if there are no tags yet.">
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

        <div v-if="formError" class="text-coral text-[13px]">{{ formError }}</div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <router-link :to="{ name: 'browse' }" class="btn-ghost">Cancel</router-link>
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
            <li>If you want to list a tagged release, push the git tag first — the validator confirms it exists. Untagged packages list as <code>main</code>-tracking.</li>
            <li>The PR CI validates the schema, SPDX licence, and that the tag exists. Errors show on the PR.</li>
            <li>You don't need to fill the commit hash — CI resolves it from the tag.</li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, h, reactive, ref } from "vue"

import { useAuthStore } from "@/stores/auth"
import { REGISTRY_OWNER, REGISTRY_REPO, REGISTRY_BRANCH } from "@/config"
import { buildEntryYaml, buildGitHubEditorUrl } from "@/utils/yamlBuilder"
import { probeRepo, projectManifest, RepoProbeError } from "@/utils/probeRepo"

const auth = useAuthStore()

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

// Repo probe state.  Runs on Verify button click + on blur of
// the repo URL field.  Successful probes auto-fill every form
// field the manifest reveals; the user can override afterwards.
const probe = reactive({
  loading: false,
  ok: false,
  error: null,
  result: null,
  filledFields: [],
  filledFieldsLabel: "",
  reset() {
    this.loading = false
    this.ok = false
    this.error = null
    this.result = null
    this.filledFields = []
    this.filledFieldsLabel = ""
  },
  async run() {
    if (!form.value.repo.trim() || this.loading) return
    this.loading = true
    this.error = null
    this.ok = false
    try {
      const result = await probeRepo(form.value.repo)
      const projected = projectManifest(result)
      this.result = result
      const filled = []
      // Only overwrite fields the user hasn't customised — defined
      // as fields still at their defaults.  Avoids stomping work
      // when the user re-clicks Verify after typing.
      function maybeSet(key, value, defaultValue) {
        if (!value) return
        if (form.value[key] !== defaultValue && form.value[key] !== "") return
        form.value[key] = value
        filled.push(key)
      }
      maybeSet("name", projected.name, "")
      maybeSet("description", projected.description, "")
      maybeSet("license", projected.license, "MIT")
      maybeSet("framework", projected.framework, ">=1.5.0,<2.0.0")
      maybeSet("homepage", projected.homepage, "")
      if (projected.tags.length > 0 && !tagsString.value.trim()) {
        tagsString.value = projected.tags.join(", ")
        filled.push("tags")
      }
      if (projected.versionTag && form.value.versionTag === "v0.1.0") {
        form.value.versionTag = projected.versionTag
        filled.push("version")
      }
      // Author defaults to the signed-in user; pre-fill from the
      // repo owner only if author is still empty.
      if (!form.value.author && result.owner) {
        form.value.author = result.owner
        filled.push("author")
      }
      this.filledFields = filled
      const friendly = {
        name: "name",
        description: "description",
        license: "license",
        framework: "framework",
        homepage: "homepage",
        tags: "tags",
        version: "version",
        author: "author",
      }
      this.filledFieldsLabel = filled.length === 0 ? "no fields (everything was already filled)" : filled.map((f) => friendly[f] || f).join(", ")
      this.ok = true
    } catch (err) {
      if (err instanceof RepoProbeError) {
        this.error = err
      } else {
        this.error = new RepoProbeError("unknown", err?.message || String(err))
      }
    } finally {
      this.loading = false
    }
  },
})

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

  window.open(url, "_blank", "noopener,noreferrer")
}

const FieldRow = (props, { slots }) => h("label", { class: "flex flex-col gap-1.5" }, [h("div", { class: "text-[12px] font-medium text-warm-600 dark:text-warm-400" }, props.label), slots.default?.(), props.hint ? h("div", { class: "text-[11px] text-warm-400 dark:text-warm-500 leading-snug" }, props.hint) : null])
FieldRow.props = ["label", "hint"]
</script>
