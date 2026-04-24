"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieAttributes,
  verifyPassword,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Voer je wachtwoord in." };
  if (!verifyPassword(password)) {
    return { error: "Onjuist wachtwoord." };
  }
  const token = await createSessionToken();
  cookies().set(SESSION_COOKIE, token, sessionCookieAttributes());
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}
