"use server";

import { ApiError, backendAuth } from "@/lib/backend";
import { errorMessage } from "@/lib/backend";
import { passwordRuleError } from "@/lib/password-rules";
import { clearSession, persistAuth } from "@/lib/session";
import { redirect } from "next/navigation";

const INVALID_LOGIN = "Your account or password is incorrect.";

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
    if (error instanceof ApiError) {
      return { error: INVALID_LOGIN };
    }
    return { error: errorMessage(error, INVALID_LOGIN) };
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
  const passwordError = passwordRuleError(password);
  if (passwordError) {
    return { error: passwordError };
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
