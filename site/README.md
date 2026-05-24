# site/

Static Vue 3 frontend for **TerrariumMarket**, deployed via
Cloudflare Pages.

## Local dev

```bash
cd site
npm install
npm run dev
```

Visit http://localhost:5173. The Vite dev server's middleware
serves the local `../registry.yaml` (rebuild it with
`npm run build-index` from the repo root) and the local
`../entries/<name>/README.md` files, so you can preview entry
changes before opening a PR.

## Production build

```bash
npm run build
```

Outputs to `dist/`. Cloudflare Pages serves this directly; no
backend server.

## Configuration

`src/config.js` carries the build-time constants:

- `REGISTRY_OWNER` / `REGISTRY_REPO` / `REGISTRY_BRANCH` — the
  GitHub repo this site reads. Change to point at a fork.
- `GITHUB_CLIENT_ID` — OAuth App client ID for Device Flow auth.
  Required only for submit / forum-post; browse works without it.
  Create the OAuth App under your GitHub org with "Device Flow"
  enabled; paste the client ID here. No client secret is needed.
- `TAG_COLOR` — map from package tag → gem-chip color class.

## Design system

The visual identity is a port of the KohakuTerrarium framework
frontend. Two files carry the bulk of it:

- `uno.config.js` — same gem palette (`iolite`, `taaffeite`,
  `aquamarine`, `amber`, `sage`, `coral`) + `warm-{50…950}`
  surface scale. Update both files together if the framework's
  palette changes.
- `src/style.css` — CSS variables for surfaces, Element Plus
  overrides for dark mode, markdown-body styling.

## File layout

```
site/
├── index.html                  ← Vite entry, dark-mode flash guard
├── vite.config.js              ← Vite config + dev-only local middleware
├── uno.config.js               ← UnoCSS palette + shortcuts
├── package.json
├── public/favicon.svg
└── src/
    ├── main.js
    ├── App.vue
    ├── router.js
    ├── style.css
    ├── config.js
    ├── components/
    │   ├── AppHeader.vue
    │   ├── AppFooter.vue
    │   ├── LoginModal.vue        ← Device Flow modal
    │   ├── MarkdownRenderer.vue  ← marked + DOMPurify
    │   ├── PackageCard.vue
    │   └── TagBadge.vue
    ├── pages/
    │   ├── Browse.vue
    │   ├── PackageDetail.vue
    │   ├── Submit.vue
    │   ├── Forum.vue
    │   ├── ForumThread.vue
    │   ├── Account.vue
    │   └── About.vue
    ├── stores/
    │   ├── registry.js           ← fetch + cache + fuse search
    │   ├── auth.js               ← GitHub Device Flow
    │   ├── forum.js              ← GitHub Discussions GraphQL
    │   └── theme.js              ← light / dark toggle
    └── utils/
        └── yamlBuilder.js        ← form → entry.yaml + web-editor URL
```
