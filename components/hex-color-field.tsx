"use client";

import { useState } from "react";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function HexColorField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const swatchValue = HEX_COLOR_PATTERN.test(value) ? value : "#000000";

  return (
    <label className="gos-label space-y-2">
      <span className="text-sm font-medium text-[color:var(--gos-primary)]">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={swatchValue}
          onChange={(event) => setValue(event.target.value)}
          aria-label={`${label} picker`}
          className="h-10 w-14 shrink-0 cursor-pointer rounded border border-[rgba(31,46,39,0.15)] bg-transparent p-1"
        />
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="#1F2E27"
          className="gos-input text-sm"
        />
      </div>
    </label>
  );
}
