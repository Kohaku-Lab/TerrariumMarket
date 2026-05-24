import { dump } from "js-yaml"

/**
 * Build a TerrariumMarket entry.yaml string from form state.
 *
 * Output mirrors entries/*\/entry.yaml exactly — same key order,
 * same shape — so the resulting PR diff is clean.
 *
 * @param {object} form
 * @param {string} form.name
 * @param {string} form.repo
 * @param {string} form.description
 * @param {string[]} form.tags
 * @param {string} form.author
 * @param {string} form.license
 * @param {string} form.homepage
 * @param {string} form.framework
 * @param {string} form.versionTag
 * @param {string} form.versionDate  ISO date
 * @param {string} form.versionNotes
 */
export function buildEntryYaml(form) {
  const entry = {
    name: form.name.trim(),
    repo: form.repo.trim().replace(/\/+$/, ""),
    description: form.description.trim(),
    tags: form.tags.filter((t) => t.trim()),
    author: form.author.trim(),
    license: form.license.trim(),
  }
  if (form.homepage?.trim()) entry.homepage = form.homepage.trim()
  entry.framework = form.framework.trim() || ">=1.5.0,<2.0.0"
  entry.versions = [
    {
      tag: form.versionTag.trim(),
      released: form.versionDate || new Date().toISOString().slice(0, 10),
      ...(form.versionNotes?.trim() ? { notes: form.versionNotes.trim() } : {}),
    },
  ]

  return dump(entry, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  })
}

/**
 * Build the GitHub web-editor URL that pre-fills a new file with
 * the given content.
 *
 * The web editor takes care of: signing the user in, forking the
 * repo if they lack write access, creating a branch, committing,
 * and opening a PR with the repo's PULL_REQUEST_TEMPLATE pre-
 * filled.  We never need to hold an OAuth token to make this work
 * — it's all on GitHub's side.
 */
export function buildGitHubEditorUrl({ owner, repo, branch, filename, content, message }) {
  const params = new URLSearchParams({
    filename,
    value: content,
  })
  if (message) params.set("message", message)
  return `https://github.com/${owner}/${repo}/new/${branch}?${params.toString()}`
}
