import { API_URL } from "./constants";
import { getStoredToken, clearStoredToken } from "./auth-store";

export async function apiFetch(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<Response> {
  const { skipAuth, ...rest } = options;
  const url = `${API_URL}/api${path}`;
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;
  const baseHeaders: Record<string, string> = {
    ...((rest.headers as Record<string, string>) ?? {}),
  };

  if (!isFormData && baseHeaders["Content-Type"] == null) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const headers: HeadersInit = baseHeaders;
  if (!skipAuth) {
    const token = await getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...rest, headers });

  if (!skipAuth && res.status === 401) {
    await clearStoredToken();
  }

  return res;
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
