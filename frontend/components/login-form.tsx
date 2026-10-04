"use client";

import { loginAction, type AuthFormState } from "@/lib/auth-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { TextField } from "@/components/fields";
import { PasswordField } from "@/components/password-field";
import { useActionState } from "react";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null as AuthFormState);
  return (
    <form action={action} className="mx-auto max-w-md space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="email" label="Email" type="email" required />
      <PasswordField name="password" label="Password" required autoComplete="current-password" />
      <SubmitButton>Log in</SubmitButton>
    </form>
  );
}
