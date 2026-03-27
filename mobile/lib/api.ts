import { API_URL } from "./constants";
import { getStoredToken, clearStoredToken } from "./auth-store";

function isFormDataBody(body: unknown): boolean {
  if (body == null || typeof FormData === "undefined") return false;
  if (body instanceof FormData) return true;
  // React Native's FormData may not pass instanceof in some runtimes
  return Array.isArray((body as { _parts?: unknown })._parts);
}

function isRetryableNetworkError(e: unknown): boolean {
  if (e instanceof TypeError) return true;
  if (e instanceof Error) {
    return /network request failed|failed to fetch|load failed|the network connection was lost|timed out|aborted/i.test(
      e.message,
    );
  }
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
  /** Extra attempts when fetch() throws (e.g. transient RN "Network request failed"). */
  networkRetries?: number;
};

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { skipAuth, networkRetries = 0, ...rest } = options;
  const url = `${API_URL}/api${path}`;
  const isFormData = isFormDataBody(rest.body);
  const baseHeaders: Record<string, string> = {
    ...((rest.headers as Record<string, string>) ?? {}),
  };
  if (url.includes(".ngrok-free.")) {
    baseHeaders["ngrok-skip-browser-warning"] = "true";
  }

  if (!isFormData && baseHeaders["Content-Type"] == null) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const headers: HeadersInit = baseHeaders;
  if (!skipAuth) {
    const token = await getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const maxAttempts = 1 + Math.max(0, networkRetries);
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { ...rest, headers });

      if (!skipAuth && res.status === 401) {
        await clearStoredToken();
      }

      return res;
    } catch (e) {
      lastError = e;
      const canRetry = attempt < maxAttempts - 1 && isRetryableNetworkError(e);
      if (!canRetry) throw e;
      await delay(350 * 2 ** attempt);
    }
  }

  throw lastError;
}

export async function apiJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed ${res.status}`);
  }
  return res.json() as Promise<T>;
}
