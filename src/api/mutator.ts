/**
 * Để trống: trình duyệt gọi `/v1` cùng origin.
 * `pnpm serve` và Cloudflare chuyển tiếp sang `API_REWRITE_TARGET`, nên không dính CORS.
 */
export const API_BASE_URL = "";

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
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message?: string }).message)
        : response.statusText;
    throw new Error(message || "Request failed");
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
}

