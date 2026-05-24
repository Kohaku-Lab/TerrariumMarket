#!/usr/bin/env node
/**
 * Build registry.yaml from entries/* /entry.yaml.
 *
 * Reads every ``entries/<name>/entry.yaml``, validates the folder
 * name matches the entry's ``name`` field, sorts the merged list,
 * stamps the current UTC timestamp, and writes ``registry.yaml`` at
 * the repo root.
 *
 * Run by:
 *   - The on-merge ``build-index.yml`` workflow, which commits the
 *     refreshed file back to ``main``.
 *   - Contributors locally before opening a PR (optional — CI
 *     re-runs it anyway).
 *   - The Vite dev server in ``site/`` so local browse always
 *     reflects the on-disk entries.
 *
 * Usage: node scripts/build_index.mjs
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { load, dump } from "js-yaml"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, "..")
const ENTRIES_DIR = join(REPO_ROOT, "entries")
const OUTPUT = join(REPO_ROOT, "registry.yaml")

function readEntry(folderName) {
  const folder = join(ENTRIES_DIR, folderName)
  if (!statSync(folder).isDirectory()) return null
  const entryPath = join(folder, "entry.yaml")
  let raw
  try {
    raw = readFileSync(entryPath, "utf8")
  } catch (err) {
    throw new Error(`Missing ${entryPath}: ${err.message}`)
  }
  const parsed = load(raw)
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`${entryPath}: not a YAML mapping`)
  }
  if (parsed.name !== folderName) {
    throw new Error(
      `${entryPath}: name field "${parsed.name}" does not match folder name "${folderName}"`,
    )
  }
  return parsed
}

function main() {
  const folders = readdirSync(ENTRIES_DIR).filter(
    (f) => !f.startsWith(".") && statSync(join(ENTRIES_DIR, f)).isDirectory(),
  )
  const packages = folders
    .map(readEntry)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    schema_version: 1,
    generated: new Date().toISOString(),
    source:
      "https://raw.githubusercontent.com/Kohaku-Lab/TerrariumMarket/main/registry.yaml",
    maintainers: [{ github: "Kohaku-Blueleaf" }],
    packages,
  }

  const yaml = dump(index, {
    lineWidth: -1, // never wrap long URLs or descriptions
    noRefs: true,
    sortKeys: false,
  })

  writeFileSync(OUTPUT, yaml, "utf8")
  console.log(`Wrote ${OUTPUT}: ${packages.length} package(s).`)
  for (const pkg of packages) {
    const tags = (pkg.tags || []).join(",")
    console.log(`  - ${pkg.name}  [${tags}]`)
  }
}

main()
