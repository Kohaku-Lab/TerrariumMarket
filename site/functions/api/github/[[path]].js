/**
 * Cloudflare Pages Function — proxy for github.com OAuth endpoints.
 *
 * GitHub's ``/login/device/code`` and ``/login/oauth/access_token``
 * endpoints do not send ``Access-Control-Allow-Origin`` headers, so
 * a static SPA on terrahub.kohaku-lab.org cannot call them directly
 * from the browser — the fetch is blocked by the browser's CORS
 * preflight.  GitHub's Device Flow is designed for CLI / device-
 * embedded clients that don't have a browser CORS layer in the way.
 *
 * This Worker forwards anything under ``/api/github/<path>`` to
 * ``https://github.com/<path>``, copies the response body + status
 * verbatim, and stamps the CORS headers the static site needs.  The
 * frontend ``stores/auth.js`` calls ``/api/github/login/device/code``
 * + ``/api/github/login/oauth/access_token`` — same-origin requests
 * the browser is happy with, that the Worker turns into upstream
 * github.com requests.
 *
 * Auto-routed by Cloudflare Pages: this file's ``[[path]]`` segment
 * matches any depth of path segments under ``/api/github/``.  No
 * wrangler config required.
 *
 * Security note: this Worker NEVER stores a GitHub client secret +
 * NEVER returns one.  Device Flow is designed for public clients;
 * the client_id is public (committed in ``site/src/config.js``)
 * and the token exchange returns the user's own OAuth access token
 * directly to the frontend.  The proxy is purely a CORS unblock —
 * it does not change the trust boundary.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
}

export async function onRequest({ request, params }) {
  // CORS preflight — answer immediately with the allow headers.
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    })
  }

  const segments = Array.isArray(params.path) ? params.path : [params.path]
  const path = segments.filter(Boolean).join("/")
  if (!path) {
    return new Response("Missing path", {
      status: 400,
      headers: CORS_HEADERS,
    })
  }

  const url = new URL(request.url)
  const upstream = `https://github.com/${path}${url.search}`

  // Forward the original request method + body verbatim, but
  // strip any client-side headers GitHub doesn't need (Cookie,
  // Origin, Referer — the upstream call is server-to-server and
  // forwarding browser-only headers can confuse GitHub's rate
  // limiter into thinking the worker is the user).
  const forwardHeaders = new Headers()
  for (const [name, value] of request.headers.entries()) {
    const lower = name.toLowerCase()
    if (lower === "accept" || lower === "content-type" || lower === "user-agent") {
      forwardHeaders.set(name, value)
    }
  }
  // GitHub requires a User-Agent on every API request.  Set one
  // identifying the proxy if the browser didn't send one.
  if (!forwardHeaders.has("user-agent")) {
    forwardHeaders.set("User-Agent", "TerrariumMarket-OAuth-Proxy/1.0")
  }
  // Always ask GitHub for JSON; their Device Flow defaults to
  // form-encoded responses if Accept isn't set, which is harder to
  // parse on the frontend.
  if (!forwardHeaders.has("accept")) {
    forwardHeaders.set("Accept", "application/json")
  }

  let upstreamResp
  try {
    upstreamResp = await fetch(upstream, {
      method: request.method,
      headers: forwardHeaders,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      redirect: "manual",
    })
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "proxy_fetch_failed",
        error_description: err.message || String(err),
      }),
      {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    )
  }

  // Pass through status + body; rebuild headers with our CORS
  // additions on top of the upstream's Content-Type (the browser
  // needs Content-Type to decide whether to parse as JSON).
  const respHeaders = new Headers(CORS_HEADERS)
  const ct = upstreamResp.headers.get("content-type")
  if (ct) respHeaders.set("Content-Type", ct)

  return new Response(upstreamResp.body, {
    status: upstreamResp.status,
    statusText: upstreamResp.statusText,
    headers: respHeaders,
  })
}
