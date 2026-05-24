import { load } from "js-yaml"

/**
 * Probe a target GitHub repo for its kohaku.yaml manifest.
 *
 * Fetches https://raw.githubusercontent.com/<owner>/<repo>/<branch>/kohaku.yaml
 * across a small set of likely default-branch names (main, master)
 * and a small set of likely manifest filenames (kohaku.yaml,
 * kohaku.yml).  Returns the parsed manifest plus the resolved
 * branch + filename so callers can show the user which path
 * actually worked.
 *
 * Also returns the latest git tag (if any) so the Submit form
 * can default the version field to a real release instead of
 * making the user type one in.
 *
 * No auth needed for public repos.  Throws RepoProbeError on
 * any failure with a structured ``code`` field the UI can
 * translate to an actionable message.
 */

export class RepoProbeError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

const BRANCHES = ["main", "master"]
const MANIFEST_NAMES = ["kohaku.yaml", "kohaku.yml"]

function parseRepoUrl(url) {
  const trimmed = (url || "")
    .trim()
    .replace(/\.git$/, "")
    .replace(/\/+$/, "")
  const m = trimmed.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/)
  if (!m) return null
  return { owner: m[1], repo: m[2] }
}

export async function probeRepo(repoUrl) {
  const parsed = parseRepoUrl(repoUrl)
  if (!parsed) {
    throw new RepoProbeError(
      "invalid_url",
      "Expected a public GitHub HTTPS URL like https://github.com/owner/repo.",
    )
  }
  const { owner, repo } = parsed

  // 1. Resolve the default branch.  Use the GitHub API; falls back
  //    to ``main`` if the API request hits the unauth rate limit
  //    (60 req/hr).
  let branch = null
  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    if (resp.ok) {
      const data = await resp.json()
      branch = data.default_branch || null
    } else if (resp.status === 404) {
      throw new RepoProbeError(
        "not_found",
        `${owner}/${repo} is not a public GitHub repository, or it doesn't exist.`,
      )
    } else if (resp.status === 403) {
      // Rate-limited.  Continue with branch guesses; the kohaku.yaml
      // fetch below is unauth too but rarely the bottleneck because
      // raw.githubusercontent.com has a separate, much higher limit.
    }
  } catch (err) {
    if (err instanceof RepoProbeError) throw err
    // Network blip; keep going with the BRANCHES guesses.
  }

  const branchesToTry = branch ? [branch, ...BRANCHES.filter((b) => b !== branch)] : BRANCHES

  // 2. Fetch the manifest.  Try each {branch, filename} until one
  //    actually returns 200 + valid YAML.
  let manifest = null
  let usedBranch = null
  let usedName = null
  let lastError = null

  for (const b of branchesToTry) {
    for (const name of MANIFEST_NAMES) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${name}`
      try {
        const resp = await fetch(url, {
          headers: { Accept: "text/yaml, text/plain, */*" },
        })
        if (!resp.ok) continue
        const text = await resp.text()
        try {
          const parsedYaml = load(text)
          if (!parsedYaml || typeof parsedYaml !== "object") {
            lastError = `${name} on ${b} is not a YAML mapping`
            continue
          }
          manifest = parsedYaml
          usedBranch = b
          usedName = name
          break
        } catch (yamlErr) {
          lastError = `Failed to parse ${name} on ${b}: ${yamlErr.message}`
          continue
        }
      } catch (err) {
        lastError = err.message
      }
    }
    if (manifest) break
  }

  if (!manifest) {
    throw new RepoProbeError(
      "no_manifest",
      `Could not find a kohaku.yaml at the root of ${owner}/${repo}.${
        lastError ? `  Last attempt: ${lastError}` : ""
      }`,
    )
  }

  // 3. Latest tag (best-effort).  Same rate-limit caveat.
  let latestTag = null
  try {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`)
    if (resp.ok) {
      const tags = await resp.json()
      if (Array.isArray(tags) && tags.length > 0) {
        latestTag = tags[0].name
      }
    }
  } catch {
    /* best-effort */
  }

  return {
    owner,
    repo,
    branch: usedBranch,
    manifestPath: usedName,
    manifest,
    latestTag,
  }
}

/**
 * Project a fetched manifest down to fields the Submit form maps
 * onto.  Tolerant of unknown / missing keys — the form will just
 * leave those untouched and let the user fill them.
 */
export function projectManifest(probeResult) {
  const m = probeResult.manifest || {}
  const tags = new Set()
  if (Array.isArray(m.creatures) && m.creatures.length > 0) tags.add("creatures")
  if (Array.isArray(m.terrariums) && m.terrariums.length > 0) tags.add("terrariums")
  if (Array.isArray(m.tools) && m.tools.length > 0) tags.add("tools")
  if (Array.isArray(m.plugins) && m.plugins.length > 0) tags.add("plugins")
  if (Array.isArray(m.skills) && m.skills.length > 0) tags.add("skills")
  if (Array.isArray(m.examples) && m.examples.length > 0) tags.add("examples")

  return {
    name: typeof m.name === "string" ? m.name : "",
    description: typeof m.description === "string" ? m.description : "",
    license: typeof m.license === "string" ? m.license : "",
    framework:
      typeof m.framework === "string"
        ? m.framework
        : typeof m.requires_framework === "string"
          ? m.requires_framework
          : "",
    homepage: typeof m.homepage === "string" ? m.homepage : typeof m.url === "string" ? m.url : "",
    tags: [...tags],
    versionTag: probeResult.latestTag || probeResult.branch,
  }
}
