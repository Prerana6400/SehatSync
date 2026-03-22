const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function getToken(): string | null {
  return localStorage.getItem("sehatsync_token");
}

export function setToken(token: string) {
  localStorage.setItem("sehatsync_token", token);
}

export function clearToken() {
  localStorage.removeItem("sehatsync_token");
}

export type ApiUser = {
  id: number;
  email: string;
  role: "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTION";
};

/** GET without Authorization; used for public routes such as `/api/public/*`. */
export async function publicFetch<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/register") {
    clearToken();
    window.dispatchEvent(new CustomEvent("sehatsync:logout"));
  }

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
    const msg = [errBody.error, errBody.detail].filter(Boolean).join(" — ");
    throw new Error(msg || `Request failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
