import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "b4t-love";
const UNLOCK_PATH = "/unlock";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isUnlocked = request.cookies.get(AUTH_COOKIE)?.value === "1";

  if (pathname === UNLOCK_PATH) {
    if (isUnlocked) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isUnlocked) {
    return NextResponse.redirect(new URL(UNLOCK_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
