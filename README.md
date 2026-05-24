# TerrariumMarket

The public marketplace for **KohakuTerrarium** packages — creatures,
terrariums, plugins, and tools shared by the community.

Live site: _(coming soon — deployed via Cloudflare Pages)_

## What's in this repo

| Path | Purpose |
|---|---|
| `registry.yaml` | The canonical index — generated from `entries/*/entry.yaml` on every merge. Every KohakuTerrarium install reads this file (or one of its mirrors) to resolve `kt install @<name>` |
| `entries/<name>/entry.yaml` | One file per package. Human-authored; CI rebuilds `registry.yaml` from these |
| `entries/<name>/README.md` | Long-form description rendered on the package detail page |
| `schemas/*.json` | JSON Schema for `entry.yaml` and `registry.yaml`; PRs are validated against these |
| `scripts/build_index.mjs` | Node script that concatenates `entries/*/entry.yaml` → `registry.yaml` |
| `site/` | The Cloudflare-Pages-hosted browser frontend (Vue 3 + Vite) |
| `.github/workflows/` | PR validation + on-merge index rebuild (no deploy workflow — Cloudflare Pages auto-deploys from the GitHub integration) |

## How submission works

Open a PR adding (or editing) `entries/<your-package>/entry.yaml`
+ `entries/<your-package>/README.md`. CI runs schema + sandbox-
install validation. A maintainer reviews and merges. The on-merge
workflow rebuilds `registry.yaml`; mirrors and clients pick up
the change on their next fetch (≤ 1 hour cache).

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full walkthrough.

## How the site works

```
                  data
                   │
   ┌───────────────┴───────────────┐
   │  registry.yaml + entries/*    │   GitHub Discussions
   │  in this repo                 │   ← forum lives here
   └───────────────────────────────┘
                   ▲
                   │ raw HTTPS
                   │
   ┌───────────────┴───────────────┐
   │  Static Vue 3 site            │
   │  in site/                     │   Cloudflare Pages
   │  Read-only browse + detail    │ → auto-deploys on
   │  + Discussions-backed forum   │   push to main
   │  + GitHub Device Flow auth    │
   │    for submit + post          │
   └───────────────────────────────┘
```

No backend service. No database. The site reads the YAML directly
over HTTPS and uses GitHub's public APIs for everything else.

## Local development

```bash
git clone https://github.com/Kohaku-Lab/TerrariumMarket.git
cd TerrariumMarket/site
npm install
npm run dev
```

Visit `http://localhost:5173`. The dev server proxies registry
reads to the local `registry.yaml` so you can preview changes
before opening a PR.

## See also

- [KohakuTerrarium framework repo](https://github.com/Kohaku-Blueleaf/KohakuTerrarium)
- [Framework docs](https://github.com/Kohaku-Blueleaf/KohakuTerrarium/tree/main/docs)
