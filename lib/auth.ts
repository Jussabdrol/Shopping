import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "slim_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function getAuthEnv() {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  return {
    password,
    secret,
    configured: Boolean(password && secret),
  };
}

export function getAuthMode(): "remote" | "local" {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  const auth = getAuthEnv();
  return dbConfigured && auth.configured ? "remote" : "local";
}

function getSecretKey(): Uint8Array {
  const { secret } = getAuthEnv();
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ sub: "app" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function getSessionFromCookies(): Promise<boolean> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function sessionCookieAttributes() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyPassword(candidate: string): boolean {
  const { password } = getAuthEnv();
  if (!password) return false;
  return timingSafeEqual(candidate, password);
}
