import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { load } from "js-yaml"
import Fuse from "fuse.js"

import { registryUrl } from "@/config"

const CACHE_KEY = "terrariummarket:registry:v1"
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Registry data store.
 *
 * Single source of truth for the package list.  Fetches
 * registry.yaml once per hour (or on force-refresh), parses + sorts
 * + indexes for fuzzy search.  Browse + PackageDetail both read
 * from this store.
 *
 * Dev: the Vite middleware in vite.config.js serves a fresh
 * registry.yaml from the local entries/* on every request.
 * Prod: hits raw.githubusercontent.com directly with a 1h cache.
 */
export const useRegistryStore = defineStore("registry", () => {
  const packages = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetched = ref(0)
  const metadata = ref({ schema_version: 1, generated: null, source: null })

  let fuseIndex = null

  function _rebuildIndex() {
    fuseIndex = new Fuse(packages.value, {
      keys: [
        { name: "name", weight: 0.5 },
        { name: "description", weight: 0.3 },
        { name: "tags", weight: 0.15 },
        { name: "author", weight: 0.05 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
  }

  function _loadCached() {
    // Dev mode always re-fetches the local registry.yaml so on-disk
    // edits show up on the next reload without manually clicking
    // the refresh button or clearing localStorage.  Cache is for
    // production only.
    if (import.meta.env.DEV) return false
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return false
      const cached = JSON.parse(raw)
      if (!cached || typeof cached !== "object") return false
      if (Date.now() - cached.at > CACHE_TTL_MS) return false
      packages.value = cached.packages || []
      metadata.value = cached.metadata || {}
      lastFetched.value = cached.at
      _rebuildIndex()
      return true
    } catch {
      return false
    }
  }

  function _saveCache() {
    if (import.meta.env.DEV) return
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          at: lastFetched.value,
          packages: packages.value,
          metadata: metadata.value,
        }),
      )
    } catch {
      /* storage full / private mode */
    }
  }

  async function fetchRegistry({ force = false } = {}) {
    if (!force && _loadCached() && packages.value.length > 0) return
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const resp = await fetch(registryUrl(), {
        headers: { Accept: "text/yaml, text/plain, */*" },
        cache: force ? "no-store" : "default",
      })
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
      }
      const yaml = await resp.text()
      const parsed = load(yaml)
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.packages)) {
        throw new Error("registry.yaml: missing or invalid `packages` array")
      }
      packages.value = parsed.packages
      metadata.value = {
        schema_version: parsed.schema_version,
        generated: parsed.generated,
        source: parsed.source,
        maintainers: parsed.maintainers || [],
      }
      lastFetched.value = Date.now()
      _rebuildIndex()
      _saveCache()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  function getByName(name) {
    return packages.value.find((p) => p.name === name) || null
  }

  /**
   * Filter + sort.  Returns a new array; never mutates state.
   *
   * @param {object} opts
   * @param {string} opts.query — fuzzy search query (empty = all)
   * @param {string|null} opts.tag — exact tag match (null = any)
   * @param {string} opts.sort — "name" | "newest" | "tag"
   */
  function search({ query = "", tag = null, sort = "newest" } = {}) {
    let list
    const q = (query || "").trim()
    if (q && fuseIndex) {
      list = fuseIndex.search(q).map((r) => r.item)
    } else {
      list = [...packages.value]
    }
    if (tag) {
      list = list.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag))
    }
    list = list.slice()
    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === "newest") {
      list.sort((a, b) => {
        const aDate = a.versions?.[0]?.released || ""
        const bDate = b.versions?.[0]?.released || ""
        return bDate.localeCompare(aDate)
      })
    }
    return list
  }

  const allTags = computed(() => {
    const set = new Set()
    for (const p of packages.value) for (const t of p.tags || []) set.add(t)
    return [...set].sort()
  })

  return {
    packages,
    loading,
    error,
    lastFetched,
    metadata,
    fetchRegistry,
    getByName,
    search,
    allTags,
  }
})
