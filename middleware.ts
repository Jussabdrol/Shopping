import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken, getAuthEnv } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/auth/login", "/auth/signout"];

export async function middleware(request: NextRequest) {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  const auth = getAuthEnv();

  // Local/demo mode: no auth enforced.
  if (!dbConfigured || !auth.configured) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (valid) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
