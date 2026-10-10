/**
 * Để trống: trình duyệt gọi `/v1` cùng origin.
 * `pnpm serve` và Cloudflare chuyển tiếp sang `API_REWRITE_TARGET`, nên không dính CORS.
 */
export const API_BASE_URL = "";

function readErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback || "Request failed";
  const body = data as { message?: unknown; error?: { message?: unknown } };
  if (typeof body.error?.message === "string" && body.error.message) {
    return body.error.message;
  }
  if (typeof body.message === "string" && body.message) return body.message;
  return fallback || "Request failed";
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: unknown;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "API không trả JSON. Kiểm tra API_REWRITE_TARGET trong .env."
      );
    }
  }

  if (!response.ok) {
    throw new Error(readErrorMessage(data, response.statusText));
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
}

