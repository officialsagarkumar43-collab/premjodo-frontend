/**
 * Unified API Client for Prem Jodo
 * Automatically attaches Authorization Bearer token & credentials for all backend requests.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "pj_access_token",
  REFRESH_TOKEN: "pj_refresh_token",
  TOKEN_EXPIRY: "pj_token_expiry",
  IS_ONBOARDED: "pj_is_onboarded",
  IS_FACE_VERIFIED: "pj_is_face_verified",
};

// Ensure only pj_ prefixed tokens are stored, remove all duplicates & sensitive data
if (typeof window !== "undefined") {
  try {
    const disallowedExact = [
      "token",
      "accessToken",
      "access_token",
      "token_expiry",
      "pj_user",
      "pj_profile",
      "user",
      "profile",
      "premjodo_user_profile",
      "pj_matches_count",
    ];
    disallowedExact.forEach((k) => localStorage.removeItem(k));

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("pj_last_active") ||
          key.startsWith("last_active") ||
          key.startsWith("pj_match") ||
          key.startsWith("pj_chat") ||
          key.startsWith("pj_battle_"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch { }
}

let inMemoryToken = null;

/**
 * Retrieve the active access token from in-memory cache or pj_access_token in localStorage
 * @returns {string|null}
 */
export function getAccessToken() {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (raw && raw !== "undefined" && raw !== "null") {
      let cleanToken = String(raw).trim();
      if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
        cleanToken = cleanToken.slice(1, -1).trim();
      }
      cleanToken = cleanToken.replace(/^Bearer\s+/i, "");
      inMemoryToken = cleanToken;
      return cleanToken;
    }
  } catch { }
  return null;
}

/**
 * Set active access token in both memory and localStorage (pj_access_token only)
 * @param {string|null} token
 */
export function setAccessToken(token) {
  if (!token) {
    inMemoryToken = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("access_token");
      } catch { }
    }
    return;
  }
  let cleanToken = String(token).trim();
  if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
    cleanToken = cleanToken.slice(1, -1).trim();
  }
  cleanToken = cleanToken.replace(/^Bearer\s+/i, "");
  inMemoryToken = cleanToken;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, cleanToken);
      // Clean up any legacy duplicates
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("access_token");
    } catch { }
  }
}

let onUnauthorizedCallback = null;
let isHandlingUnauthorized = false;

/**
 * Register a callback to be called when an unauthorized (401) response is detected.
 * @param {Function} callback
 */
export function setUnauthorizedHandler(callback) {
  onUnauthorizedCallback = callback;
}

/**
 * Handle 401 Unauthorized API responses across the application.
 * Automatically clears stored session/tokens and dispatches pj-auth-changed event.
 * If user is on a protected route, redirects to home page.
 * @param {string} endpoint
 */
export function handleUnauthorizedResponse(endpoint = "") {
  if (typeof window === "undefined") return;

  // Don't auto-logout if user is on public OTP/Google login verification endpoints
  const isAuthVerificationEndpoint =
    endpoint.includes("/auth/send-otp") ||
    endpoint.includes("/auth/verify-otp") ||
    endpoint.includes("/auth/google");

  if (isAuthVerificationEndpoint) return;

  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  try {
    // 1. Clear tokens in-memory and in localStorage
    setAccessToken(null);
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      localStorage.removeItem(STORAGE_KEYS.IS_ONBOARDED);
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_expiry");
      localStorage.removeItem("isOnboarded");
      localStorage.removeItem("is_onboarded");

      const disallowedExact = [
        "pj_user",
        "pj_profile",
        "user",
        "profile",
        "premjodo_user_profile",
        "pj_matches_count",
      ];
      disallowedExact.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch { }
      });
    }

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    }

    // 2. Trigger registered auth handler if available
    if (typeof onUnauthorizedCallback === "function") {
      try {
        onUnauthorizedCallback();
      } catch (cbErr) {
        console.warn("[apiClient] Unauthorized callback error:", cbErr);
      }
    }

    // 3. Dispatch global auth changed event so AuthContext immediately clears React state
    window.dispatchEvent(new Event("pj-auth-changed"));

    // 4. If currently on a protected route (/user or /onboarding), redirect to home page
    const pathname = window.location.pathname || "";
    if (pathname.startsWith("/user") || pathname.startsWith("/onboarding")) {
      window.location.href = "/";
    }
  } catch (err) {
    console.warn("[apiClient] 401 Unauthorized handling error:", err);
  } finally {
    setTimeout(() => {
      isHandlingUnauthorized = false;
    }, 500);
  }
}

/**
 * Standard fetch wrapper that automatically appends Authorization header and credentials
 * @param {string} endpoint - API path (e.g. '/matches/list' or full URL)
 * @param {RequestInit} [options] - Standard Fetch Options
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const method = (options.method || "GET").toUpperCase();
  const maxRetries = options.retries !== undefined ? options.retries : (method === "GET" ? 2 : 0);
  let attempt = 0;

  const getFetchOptions = () => {
    const token = getAccessToken();

    let requestHeaders = {};
    if (options.headers instanceof Headers) {
      options.headers.forEach((val, key) => {
        requestHeaders[key] = val;
      });
    } else if (options.headers && typeof options.headers === "object") {
      requestHeaders = { ...options.headers };
    }

    if (!requestHeaders["Content-Type"] && !requestHeaders["content-type"] && !(options.body instanceof FormData)) {
      requestHeaders["Content-Type"] = "application/json";
    }

    if (token) {
      const cleanToken = String(token).trim().replace(/^Bearer\s+/i, "");
      requestHeaders["Authorization"] = `Bearer ${cleanToken}`;
    }

    return {
      ...options,
      headers: requestHeaders,
      credentials: "include", // sends cookies alongside bearer header
    };
  };

  while (attempt <= maxRetries) {
    const fetchOptions = getFetchOptions();

    try {
      const response = await fetch(url, fetchOptions);

      // Global 401 Unauthorized Interceptor Middleware for protected APIs
      if (response.status === 401) {
        handleUnauthorizedResponse(endpoint);
        return response;
      }

      // Retry on transient gateway errors (502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout)
      // which commonly happen on Render.com cold starts
      const isTransientServerError = [502, 503, 504].includes(response.status);
      if (isTransientServerError && attempt < maxRetries) {
        attempt++;
        const backoffMs = 1000 * attempt;
        await new Promise((res) => setTimeout(res, backoffMs));
        continue;
      }

      return response;
    } catch (error) {
      // Attempt automatic fallback between localhost and 127.0.0.1 if network resolution failed
      if (url.includes("localhost") && error instanceof TypeError && error.message === "Failed to fetch") {
        try {
          const fallbackUrl = url.replace("localhost", "127.0.0.1");
          const fbResponse = await fetch(fallbackUrl, fetchOptions);
          if (fbResponse.status === 401) {
            handleUnauthorizedResponse(endpoint);
          }
          return fbResponse;
        } catch { }
      } else if (url.includes("127.0.0.1") && error instanceof TypeError && error.message === "Failed to fetch") {
        try {
          const fallbackUrl = url.replace("127.0.0.1", "localhost");
          const fbResponse = await fetch(fallbackUrl, fetchOptions);
          if (fbResponse.status === 401) {
            handleUnauthorizedResponse(endpoint);
          }
          return fbResponse;
        } catch { }
      }

      if (attempt < maxRetries) {
        attempt++;
        const backoffMs = 1200 * attempt;
        await new Promise((res) => setTimeout(res, backoffMs));
        continue;
      }

      if (typeof window !== "undefined") {
        console.warn(`[apiClient] Network request failed for ${url}. Is backend running on ${API_BASE_URL}?`, error?.message || error);
      }
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        const friendlyError = new Error(`Cannot connect to server at ${API_BASE_URL}. Please check internet connection or backend server status.`);
        friendlyError.cause = error;
        throw friendlyError;
      }
      throw error;
    }
  }
}

export default apiFetch;
