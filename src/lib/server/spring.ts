const DEFAULT_SPRING_API_URL = "http://localhost:8080";

export function getSpringApiUrl() {
  return (process.env.SPRING_API_URL || DEFAULT_SPRING_API_URL).replace(/\/$/g, "");
}

export async function springFetch(path: string, init?: RequestInit) {
  return fetch(`${getSpringApiUrl()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
}

export async function parseSpringResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function getRefreshTokenFromSetCookie(setCookie: string | null) {
  if (!setCookie) return undefined;

  const match = setCookie.match(/(?:^|,\s*)refreshToken=([^;]+)/);
  return match?.[1];
}

export function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  if (typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

