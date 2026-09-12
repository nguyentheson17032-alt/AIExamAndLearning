"use client";

import { registerAction, type AuthFormState } from "@/lib/auth-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { TextField } from "@/components/fields";
import { useActionState } from "react";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, null as AuthFormState);
  return (
    <form action={action} className="mx-auto max-w-md space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="displayName" label="Display name" required />
      <TextField name="email" label="Email" type="email" required />
      <TextField name="password" label="Password" type="password" required />
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
