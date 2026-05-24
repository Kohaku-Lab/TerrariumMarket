# Contributing to TerrariumMarket

Thanks for sharing what you built with KohakuTerrarium! There are
two distinct kinds of contribution:

1. **Listing a package** — add or update `entries/<name>/entry.yaml`
2. **Improving the marketplace itself** — changes to `site/`,
   `schemas/`, `scripts/`, or this repo's docs

## Listing a package

### What you need ready

- A **public GitHub repo** containing a `kohaku.yaml` manifest at
  its root. Run `kt validate` locally to confirm the manifest
  parses + the framework can load each declared creature/terrarium.
- At least **one git tag** marking the version you want to list
  (e.g. `v0.1.0`). TerrariumMarket pins to commits, so the tag
  needs to exist when the PR validator runs.
- A **README.md** in your package repo — the listing's detail page
  renders an excerpt + links to the full one.
- An **SPDX license identifier** (MIT, Apache-2.0, GPL-3.0-only,
  etc). CC0 / unlicensed packages won't be listed — users need to
  know the licence to confidently install.

### Submission steps

1. Fork this repo.
2. Create a new folder `entries/<your-package>/`.
3. Add `entry.yaml` following the schema in
   [`schemas/entry.schema.json`](schemas/entry.schema.json) — see the
   existing entries under `entries/` for examples.
4. Add `README.md` with the long-form description; max ~1500 words.
   You can reference images at `entries/<your-package>/assets/*.png`
   (kept inside this repo so the site can always render them).
5. Open a PR.

The on-PR validator workflow runs automatically and checks:

| Check           | What it verifies                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Schema          | `entry.yaml` parses + matches the JSON Schema                                                                    |
| SPDX            | `license` is a recognised SPDX identifier                                                                        |
| GitHub          | `author` is a real GitHub username                                                                               |
| Tag             | each `versions[].tag` exists in the source repo + the commit hash matches                                        |
| Manifest        | the source repo's `kohaku.yaml` at the tagged commit declares the same `name` + `version` + framework constraint |
| Sandbox install | `kt install <git-url>@<tag>` succeeds in a clean container; `kt list` finds the package                          |

You don't need to fill the `versions[].commit` field — the validator
resolves it for you from the tag and commits the resolved hash back
to the PR.

A maintainer reviews and merges. On merge, the on-merge workflow
re-builds `registry.yaml` and pushes it to `main`; Cloudflare Pages
auto-deploys the site within a minute. Mirrors and clients pick
up the new entry on their next 1-hour cache refresh.

### Updating an existing listing

Open a PR editing `entries/<your-package>/entry.yaml`. Add a new
item to `versions[]` for the new release (newest-first). Edit
`entries/<your-package>/README.md` if needed. Same validator
runs, same merge process.

### Withdrawing a version

Add `yanked: true` to the `versions[]` entry you want to retire.
The CLI still recognises the version for reproducibility on existing
installs, but `kt install @your-package` (no version pin) will skip
yanked versions when picking the newest compatible one.

### Removing the whole listing

PR deleting the entire `entries/<your-package>/` directory.
Mention "withdrawing package" in the PR title.

## Improving the marketplace

`site/`, `schemas/`, `scripts/`, `.github/workflows/` — normal PR
flow. Lint the site with `npm run format:check` from `site/`.
Tests (when present) live alongside the code; run with
`npm run test`.

## Code of conduct

Be kind, assume good intent, and remember every contributor here is
a maker like you. Disagreements over technical decisions are
welcome; personal attacks are not.

## Questions

Open a Discussion in this repo's **General** category, or post to
the KohakuTerrarium framework repo if your question is about the
framework itself.
