import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

const authPaths = ["/admin", "/auth", "/api/admin"];

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);
  const needsAuth = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_SECRET || !process.env.AUTH0_CLIENT_ID) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Auth0 is not configured. Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, and AUTH0_SECRET." },
        { status: 503 },
      );
    }
    return new NextResponse(
      "Auth0 is not configured. Add the AUTH0_* variables from .env.example, then restart.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  return auth0.middleware(request);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/auth/:path*",
    "/api/admin/:path*",
  ],
};
