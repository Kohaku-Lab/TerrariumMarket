import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { request } from "@octokit/request"

import { GITHUB_CLIENT_ID, GITHUB_SCOPES } from "@/config"

const TOKEN_KEY = "terrariummarket:gh-token"
const USER_KEY = "terrariummarket:gh-user"

/**
 * GitHub OAuth Device Flow auth.
 *
 * Mirrors the framework's CodexLoginModal pattern — public client
 * (no client secret), polling, retry-on-pending.  Token lives in
 * localStorage with ``public_repo`` scope; revocable any time from
 * the user's GitHub settings.
 *
 * State machine:
 *
 *   idle ──start()──▶ requesting_code ──ok──▶ awaiting_user ──poll ok──▶ exchanging
 *      ▲                                                           │
 *      │                                                           ▼
 *      └─────── error / cancel / signOut() ◀──── ready ◀──fetch user
 */
export const useAuthStore = defineStore("auth", () => {
  const phase = ref("idle") // idle | requesting_code | awaiting_user | exchanging | ready | error
  const userCode = ref("")
  const verificationUri = ref("")
  const verificationUriComplete = ref("")
  const expiresIn = ref(0)
  const interval = ref(5)
  const errorMessage = ref("")
  const token = ref("")
  const user = ref(null)

  let pollTimer = null
  let deviceCode = ""

  function configured() {
    return Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_ID.length > 0)
  }

  const signedIn = computed(() => phase.value === "ready" && Boolean(token.value))

  function hydrate() {
    try {
      const t = localStorage.getItem(TOKEN_KEY)
      const u = localStorage.getItem(USER_KEY)
      if (t) {
        token.value = t
        phase.value = "ready"
      }
      if (u) user.value = JSON.parse(u)
    } catch {
      /* corrupted localStorage; ignore */
    }
  }

  async function start() {
    if (!configured()) {
      phase.value = "error"
      errorMessage.value =
        "GitHub OAuth client ID not configured. See src/config.js to set GITHUB_CLIENT_ID."
      return
    }
    if (phase.value === "awaiting_user") return // already running

    cancel({ silent: true })
    phase.value = "requesting_code"
    errorMessage.value = ""

    try {
      const resp = await fetch("https://github.com/login/device/code", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GITHUB_CLIENT_ID,
          scope: GITHUB_SCOPES,
        }),
      })
      const data = await resp.json()
      if (!resp.ok || data.error) {
        throw new Error(data.error_description || data.error || `HTTP ${resp.status}`)
      }
      deviceCode = data.device_code
      userCode.value = data.user_code
      verificationUri.value = data.verification_uri
      verificationUriComplete.value = data.verification_uri_complete || ""
      expiresIn.value = data.expires_in || 900
      interval.value = Math.max(5, Number(data.interval) || 5)
      phase.value = "awaiting_user"
      schedulePoll()
    } catch (err) {
      phase.value = "error"
      errorMessage.value = err?.message || String(err)
    }
  }

  function schedulePoll() {
    if (pollTimer) clearTimeout(pollTimer)
    pollTimer = setTimeout(poll, interval.value * 1000)
  }

  async function poll() {
    if (phase.value !== "awaiting_user") return
    try {
      const resp = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GITHUB_CLIENT_ID,
          device_code: deviceCode,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      })
      const data = await resp.json()

      if (data.access_token) {
        phase.value = "exchanging"
        token.value = data.access_token
        try {
          localStorage.setItem(TOKEN_KEY, token.value)
        } catch {
          /* noop */
        }
        await fetchUser()
        phase.value = "ready"
        return
      }

      switch (data.error) {
        case "authorization_pending":
          schedulePoll()
          return
        case "slow_down":
          interval.value += 5
          schedulePoll()
          return
        case "expired_token":
          phase.value = "error"
          errorMessage.value = "Device code expired. Tap Retry to request a new one."
          return
        case "access_denied":
          phase.value = "error"
          errorMessage.value = "Authorization was denied."
          return
        default:
          phase.value = "error"
          errorMessage.value = data.error_description || data.error || `HTTP ${resp.status}`
      }
    } catch (err) {
      phase.value = "error"
      errorMessage.value = err?.message || String(err)
    }
  }

  async function fetchUser() {
    try {
      const { data } = await request("GET /user", {
        headers: { authorization: `token ${token.value}` },
      })
      user.value = data
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(data))
      } catch {
        /* noop */
      }
    } catch (err) {
      // Token may be valid but /user can transiently fail; don't
      // un-sign the user just because of a hiccup.
      console.warn("auth: failed to fetch /user", err)
    }
  }

  function cancel({ silent = false } = {}) {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
    if (!silent) {
      phase.value = "idle"
    }
    userCode.value = ""
    verificationUri.value = ""
    verificationUriComplete.value = ""
    expiresIn.value = 0
    deviceCode = ""
  }

  function signOut() {
    cancel({ silent: true })
    token.value = ""
    user.value = null
    phase.value = "idle"
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      /* noop */
    }
  }

  return {
    // state
    phase,
    userCode,
    verificationUri,
    verificationUriComplete,
    expiresIn,
    errorMessage,
    token,
    user,
    // derived
    signedIn,
    configured,
    // actions
    hydrate,
    start,
    cancel,
    signOut,
  }
})
