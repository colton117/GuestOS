"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Loader2 } from "lucide-react";
import {
  browserSupportsWebAuthn,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/browser";

export function PasskeySetupPrompt({ destination }: { destination: string }) {
  const router = useRouter();
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<PublicKeyCredentialCreationOptionsJSON | null>(null);

  // Fetched ahead of the click rather than inside handleSetUp: if
  // navigator.credentials.create() isn't the first thing to happen after the
  // user's tap, Safari/iOS no longer treats the call as directly
  // gesture-triggered and drops the on-device "save to Passwords" option,
  // leaving only the QR/security-key fallback.
  async function fetchOptions(): Promise<PublicKeyCredentialCreationOptionsJSON | null> {
    try {
      const optionsResponse = await fetch("/api/webauthn/registration/options", {
        method: "POST",
      });

      if (!optionsResponse.ok) {
        return null;
      }

      const optionsJSON = (await optionsResponse.json()) as PublicKeyCredentialCreationOptionsJSON;
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

  function goToDestination() {
    router.push(destination);
    router.refresh();
  }

  async function handleSetUp() {
    setStatus("pending");
    setError(null);

    try {
      const optionsJSON = options ?? (await fetchOptions());

      if (!optionsJSON) {
        throw new Error("Couldn't start passkey setup.");
      }

      setOptions(null);
      const attestation: RegistrationResponseJSON = await startRegistration({ optionsJSON });

      const verifyResponse = await fetch("/api/webauthn/registration/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: attestation }),
      });

      const verifyBody = (await verifyResponse.json().catch(() => null)) as { error?: string } | null;

      if (!verifyResponse.ok) {
        throw new Error(verifyBody?.error ?? "Couldn't finish setting up that passkey.");
      }

      setStatus("done");
    } catch (caught) {
      if (caught instanceof Error && caught.name === "NotAllowedError") {
        // Guest cancelled the browser's passkey prompt — not an error worth surfacing.
        setStatus("idle");
        void fetchOptions();
        return;
      }

      setError(caught instanceof Error ? caught.message : "Couldn't finish setting up that passkey.");
      setStatus("idle");
      void fetchOptions();
    }
  }

  if (status === "done") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[color:var(--gos-success)]">
          Passkey set up. You can sign in with Face ID, Touch ID, or Windows Hello next time.
        </p>
        <button type="button" onClick={goToDestination} className="gos-button-primary w-full text-sm">
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {supported ? (
        <button
          type="button"
          onClick={handleSetUp}
          disabled={status === "pending"}
          className="gos-button-primary w-full text-sm disabled:opacity-60"
        >
          {status === "pending" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Fingerprint className="h-4 w-4" />
          )}
          Set up a passkey
        </button>
      ) : null}
      {error ? <p className="text-center text-sm text-[color:var(--gos-error)]">{error}</p> : null}
      <button
        type="button"
        onClick={goToDestination}
        className="block w-full text-center text-sm text-[color:var(--gos-muted)] underline underline-offset-4"
      >
        Skip for now
      </button>
    </div>
  );
}
