import type { NextRequest, NextResponse } from "next/server";

import type { AuthRole } from "./routes";

export const ACCESS_TOKEN_COOKIE = "clickagende_access";
export const REFRESH_TOKEN_COOKIE = "clickagende_refresh";

export type AuthSession = {
  email: string;
  roles: AuthRole[];
  exp?: number;
};

type JwtPayload = {
  sub?: string;
  roles?: string[];
  exp?: number;
};

const DEFAULT_DEV_JWT_SECRET = "NzE0ZDA3ZGYtYjA4Yy00ZGQ5LTgxMmQtN2U3YjMyNmI5YjVmCg==";

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

async function verifyHs256(token: string) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const decodedHeader = JSON.parse(new TextDecoder().decode(base64UrlToBytes(header))) as { alg?: string };
  if (decodedHeader.alg !== "HS256") return null;

  const secret = process.env.SPRING_JWT_SECRET || process.env.AUTH_JWT_SECRET || DEFAULT_DEV_JWT_SECRET;
  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(secret), (char) => char.charCodeAt(0)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${header}.${payload}`),
  );
  const expected = bytesToBase64Url(new Uint8Array(signed));
  if (!timingSafeEqual(expected, signature)) return null;

  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as JwtPayload;
}

export async function readSessionFromToken(token?: string): Promise<AuthSession | null> {
  if (!token) return null;

  try {
    const payload = await verifyHs256(token);
    if (!payload?.sub || !Array.isArray(payload.roles)) return null;
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;

    return {
      email: payload.sub,
      roles: payload.roles as AuthRole[],
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function readSessionFromRequest(request: NextRequest) {
  return readSessionFromToken(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string,
) {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });

  if (refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60,
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 0,
  });
}
