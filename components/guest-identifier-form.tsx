"use client";

import { useRef } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PHONE_DIGITS = 10;
const AUTO_SUBMIT_DEBOUNCE_MS = 500;

function looksComplete(value: string) {
  const trimmed = value.trim();
  if (EMAIL_PATTERN.test(trimmed)) return true;
  return trimmed.replace(/\D/g, "").length >= MIN_PHONE_DIGITS;
}

export function GuestIdentifierForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!looksComplete(event.target.value)) return;

    timerRef.current = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, AUTO_SUBMIT_DEBOUNCE_MS);
  }

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <label className="gos-label space-y-2">
        <span className="text-sm font-medium text-[color:var(--gos-primary)]">
          Email or Phone Number
        </span>
        <input
          name="identifier"
          required
          autoFocus
          placeholder="you@example.com or (555) 123-4567"
          className="gos-input text-sm"
          onChange={handleChange}
        />
      </label>
      <p className="text-xs text-[color:var(--gos-muted)]">
        We&rsquo;ll continue automatically once you finish typing.
      </p>
    </form>
  );
}
