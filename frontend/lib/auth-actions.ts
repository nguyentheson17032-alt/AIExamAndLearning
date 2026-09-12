"use server";

import { backendAuth } from "@/lib/backend";
import { errorMessage } from "@/lib/backend";
import { clearSession, persistAuth } from "@/lib/session";
import { redirect } from "next/navigation";

export type AuthFormState = { error: string } | null;

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  try {
    const auth = await backendAuth("/api/v1/auth/login", { email, password });
    await persistAuth(auth);
  } catch (error) {
    return { error: errorMessage(error, "Login failed") };
  }
  redirect("/");
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!email || !password || !displayName) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  try {
    const auth = await backendAuth("/api/v1/auth/register", { email, password, displayName });
    await persistAuth(auth);
  } catch (error) {
    return { error: errorMessage(error, "Register failed") };
  }
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
