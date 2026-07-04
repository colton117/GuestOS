"use client";

import { useFormStatus } from "react-dom";
import type { ComponentPropsWithoutRef } from "react";

type SubmitButtonProps = ComponentPropsWithoutRef<"button"> & {
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  className,
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={className}
      {...rest}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
