import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import unocss from "unocss/vite"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

// Dev-only middleware that serves the locally-built registry.yaml
// so the site's registry fetcher hits the developer's own
// entries/ dir instead of round-tripping to GitHub.  In
// production the same fetcher hits raw.githubusercontent.com.
function localRegistryPlugin() {
  return {
    name: "terrariummarket-local-registry",
    configureServer(server) {
      server.middlewares.use("/__local__/registry.yaml", (_req, res) => {
        try {
          const yaml = readFileSync(resolve(__dirname, "../registry.yaml"), "utf8")
          res.setHeader("Content-Type", "text/yaml; charset=utf-8")
          res.setHeader("Cache-Control", "no-store")
          res.end(yaml)
        } catch (err) {
          res.statusCode = 500
          res.end(`Local registry not built. Run "npm run build-index" in the repo root.\n${err}`)
        }
      })

      // Same for entries/<name>/README.md so the package detail
      // page renders against local copy in dev.
      server.middlewares.use("/__local__/entries", (req, res) => {
        const cleaned = (req.url || "").split("?")[0].replace(/^\/+/, "")
        if (!cleaned) {
          res.statusCode = 400
          res.end("missing path")
          return
        }
        const safe = cleaned.split("/").filter((part) => part && part !== "..")
        const target = resolve(__dirname, "../entries", ...safe)
        try {
          const body = readFileSync(target, "utf8")
          res.setHeader(
            "Content-Type",
            target.endsWith(".md") ? "text/markdown; charset=utf-8" : "text/plain; charset=utf-8",
          )
          res.setHeader("Cache-Control", "no-store")
          res.end(body)
        } catch (err) {
          res.statusCode = 404
          res.end(`not found: ${target}\n${err}`)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), unocss(), localRegistryPlugin()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    // Mirror the Cloudflare Pages Function at
    // functions/api/github/[[path]].js — local dev gets the same
    // ``/api/github/...`` URL shape so auth.js doesn't need a
    // dev-vs-prod branch.  Forwards verbatim to github.com (Vite
    // server-side fetch, no browser CORS).
    proxy: {
      "/api/github": {
        target: "https://github.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/github/, ""),
      },
    },
  },
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "el-plus": ["element-plus"],
          octokit: ["@octokit/graphql", "@octokit/request"],
          markdown: ["marked", "dompurify"],
        },
      },
    },
  },
})
