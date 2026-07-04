"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Loader2 } from "lucide-react";
import {
  browserSupportsWebAuthn,
  startAuthentication,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";

export function PasskeyLoginButton() {
  const router = useRouter();
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<PublicKeyCredentialRequestOptionsJSON | null>(null);

  // Fetched ahead of the click rather than inside handleClick: if
  // navigator.credentials.get() isn't the first thing to happen after the
  // user's tap, Safari/iOS no longer treats the call as directly
  // gesture-triggered and drops the on-device "use Passwords" option,
  // leaving only the QR/security-key fallback.
  async function fetchOptions(): Promise<PublicKeyCredentialRequestOptionsJSON | null> {
    try {
      const optionsResponse = await fetch("/api/webauthn/authentication/options", {
        method: "POST",
      });

      if (!optionsResponse.ok) {
        return null;
      }

      const optionsJSON = (await optionsResponse.json()) as PublicKeyCredentialRequestOptionsJSON;
      setOptions(optionsJSON);
      return optionsJSON;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const isSupported = browserSupportsWebAuthn();
    setSupported(isSupported);

    if (isSupported) {
      void fetchOptions();
    }
  }, []);

  if (!supported) {
    return null;
  }

  async function handleClick() {
    setStatus("pending");
    setError(null);

    try {
      const optionsJSON = options ?? (await fetchOptions());

      if (!optionsJSON) {
        throw new Error("Couldn't start passkey sign-in.");
      }

      setOptions(null);
      const assertion: AuthenticationResponseJSON = await startAuthentication({ optionsJSON });

      const verifyResponse = await fetch("/api/webauthn/authentication/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: assertion }),
      });

      const verifyBody = (await verifyResponse.json()) as { error?: string; destination?: string };

      if (!verifyResponse.ok || !verifyBody.destination) {
        throw new Error(verifyBody.error ?? "Couldn't verify that passkey.");
      }

      router.push(verifyBody.destination);
      router.refresh();
    } catch (caught) {
      if (caught instanceof Error && caught.name === "NotAllowedError") {
        // Guest cancelled the browser's passkey prompt — not an error worth surfacing.
        setStatus("idle");
        void fetchOptions();
        return;
      }

      setError(caught instanceof Error ? caught.message : "Couldn't verify that passkey.");
      setStatus("idle");
      void fetchOptions();
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "pending"}
        className="gos-button-secondary w-full text-sm disabled:opacity-60"
      >
        {status === "pending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Fingerprint className="h-4 w-4" />
        )}
        Sign in with a passkey
      </button>
      {error ? <p className="text-center text-sm text-[color:var(--gos-error)]">{error}</p> : null}
    </div>
  );
}
