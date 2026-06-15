import { NextResponse, type NextRequest } from "next/server";

import { clearAuthCookies, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";
import { springFetch } from "@/lib/server/spring";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await springFetch("/api/auth/logout", {
      method: "POST",
      headers: {
        cookie: `refreshToken=${refreshToken}`,
      },
    }).catch(() => null);
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}

