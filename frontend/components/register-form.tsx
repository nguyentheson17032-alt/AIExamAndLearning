"use client";

import { registerAction, type AuthFormState } from "@/lib/auth-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { TextField } from "@/components/fields";
import { PasswordField } from "@/components/password-field";
import { PASSWORD_RULES } from "@/lib/password-rules";
import { useActionState, useState } from "react";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, null as AuthFormState);
  const [password, setPassword] = useState("");
  return (
    <form action={action} className="mx-auto max-w-md space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="displayName" label="Display name" required />
      <TextField name="email" label="Email" type="email" required />
      <PasswordField
        name="password"
        label="Password"
        required
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <ul className="space-y-1 text-xs">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li key={rule.id} className={met ? "text-accent" : "text-muted"}>
              {met ? "✓" : "○"} {rule.label}
            </li>
          );
        })}
      </ul>
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
