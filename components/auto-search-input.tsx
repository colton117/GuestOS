"use client";

import { useRef } from "react";

const AUTO_SUBMIT_DEBOUNCE_MS = 400;

export function AutoSearchInput({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (timerRef.current) clearTimeout(timerRef.current);
    const form = event.target.form;
    timerRef.current = setTimeout(() => {
      form?.requestSubmit();
    }, AUTO_SUBMIT_DEBOUNCE_MS);
  }

  return (
    <input
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={handleChange}
      className="gos-input text-sm"
    />
  );
}
