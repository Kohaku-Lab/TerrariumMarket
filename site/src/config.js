/**
 * Build-time site config.
 *
 * Tweak these constants if you fork the registry — the site code
 * never hardcodes the upstream slug anywhere else.
 */

// GitHub repo that hosts the data + Discussions forum.
export const REGISTRY_OWNER = "Kohaku-Lab"
export const REGISTRY_REPO = "TerrariumMarket"
export const REGISTRY_BRANCH = "main"

// Raw URL to the canonical registry.yaml.  In dev (when
// import.meta.env.DEV is true) the site fetches /__local__/registry.yaml
// served by the Vite middleware in vite.config.js instead.
export const REGISTRY_RAW_URL = `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${REGISTRY_BRANCH}/registry.yaml`

// Raw URL template for entries/<name>/README.md.  Used by the
// PackageDetail page; replaced with the local middleware in dev.
export function entryReadmeUrl(name) {
  if (import.meta.env.DEV) return `/__local__/entries/${name}/README.md`
  return `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${REGISTRY_BRANCH}/entries/${name}/README.md`
}

// Source-of-truth URL for the index — same value the registry
// metadata's ``source`` field carries.  Used by client cache keys
// + the "view raw" link on the About page.
export function registryUrl() {
  if (import.meta.env.DEV) return "/__local__/registry.yaml"
  return REGISTRY_RAW_URL
}

// GitHub OAuth App client ID for Device Flow.  Created under the
// ``Kohaku-Lab`` org with Device Flow enabled.  Without a valid
// client ID the sign-in / submit / post flows fail with a clear
// "OAuth not configured" message; browse / read flows work
// unauthenticated.
//
// IMPORTANT: client_secret is NEVER stored in the frontend.
// Device Flow is designed for public clients and only needs the
// public ID.  This value is safe to commit.
export const GITHUB_CLIENT_ID = "Ov23liZ6i2tHHzib3MWw"

// Scopes requested at Device Flow start.  ``public_repo`` is the
// minimum needed to fork the registry, push a branch, open a PR,
// and post to public Discussions.
export const GITHUB_SCOPES = "public_repo"

// Brand strings.
export const SITE_NAME = "TerrariumMarket"
export const SITE_TAGLINE = "The package marketplace for KohakuTerrarium"

// Tag → chip-color routing.  Anything not in the map falls back
// to chip-warm.
export const TAG_COLOR = {
  creatures: "iolite",
  terrariums: "taaffeite",
  plugins: "aqua",
  tools: "sage",
  official: "amber",
  examples: "warm",
}
