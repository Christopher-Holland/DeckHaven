import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/sets",
  "/collection",
  "/decks",
  "/wishlist",
  "/settings",
];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Stack Auth session/access cookie
  const hasAccessCookie = Boolean(request.cookies.get("stack-access")?.value);

  if (!hasAccessCookie) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Only run middleware on protected routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sets/:path*",
    "/collection/:path*",
    "/decks/:path*",
    "/wishlist/:path*",
    "/settings/:path*",
  ],
};