const DEFAULT_SECRET = "haisapa-frontend-demo-secret"
const DEFAULT_EXPIRES_IN = 60 * 60 * 24

function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(value)
  let binary = ""
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function createSignature(unsignedToken, secret) {
  return encodeBase64Url(`${unsignedToken}.${secret}`)
}

export function createJwtToken(payload, options = {}) {
  const secret = options.secret || DEFAULT_SECRET
  const expiresIn = options.expiresIn ?? DEFAULT_EXPIRES_IN
  const now = Math.floor(Date.now() / 1000)

  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const body = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  }

  const encodedHeader = encodeBase64Url(JSON.stringify(header))
  const encodedPayload = encodeBase64Url(JSON.stringify(body))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`
  const signature = createSignature(unsignedToken, secret)

  return `${unsignedToken}.${signature}`
}

export function decodeJwtToken(token) {
  if (!token || typeof token !== "string") return null

  const parts = token.split(".")
  if (parts.length !== 3) return null

  try {
    return JSON.parse(decodeBase64Url(parts[1]))
  } catch {
    return null
  }
}

export function isJwtTokenExpired(token) {
  const payload = decodeJwtToken(token)
  if (!payload?.exp) return true
  return payload.exp <= Math.floor(Date.now() / 1000)
}
