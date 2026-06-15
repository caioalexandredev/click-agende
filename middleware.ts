import type { NextRequest } from "next/server";

import { authGuard } from "@/lib/auth/guard";

export function middleware(request: NextRequest) {
  return authGuard(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
