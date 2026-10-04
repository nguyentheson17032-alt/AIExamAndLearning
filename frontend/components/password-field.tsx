"use client";

import { useState } from "react";

export function PasswordField({
  name,
  label,
  required = false,
  value,
  onChange,
  autoComplete,
}: {
  name: string;
  label: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = `${name}-password`;
  return (
    <div className="block text-sm">
      <label htmlFor={inputId} className="font-medium">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className="w-full rounded-md border border-line bg-card py-2 pl-3 pr-10"
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={visible}
          onMouseDown={(event) => {
            event.preventDefault();
            setVisible((current) => !current);
          }}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 004.2 4.2" />
      <path d="M9.9 5.1A10.8 10.8 0 0112 5c6.5 0 10 7 10 7a18.5 18.5 0 01-4.1 5.2" />
      <path d="M6.1 6.1A18.4 18.4 0 002 12s3.5 7 10 7a10.8 10.8 0 004.9-1.2" />
    </svg>
  );
}
