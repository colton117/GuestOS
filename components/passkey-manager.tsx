"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Loader2, Trash2 } from "lucide-react";
import {
  browserSupportsWebAuthn,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import { deleteGuestCredentialAction } from "@/lib/portal-actions";
import { guessDeviceLabel } from "@/lib/device-label";

export interface GuestCredentialSummary {
  id: string;
  deviceLabel: string | null;
  createdLabel: string;
}

export function PasskeyManager({
  credentials,
}: {
  credentials: GuestCredentialSummary[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<"idle" | "registering" | "done">("idle");
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

  async function handleSetUp() {
    setStatus("registering");
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
        body: JSON.stringify({ response: attestation, deviceLabel: guessDeviceLabel() }),
      });

      const verifyBody = (await verifyResponse.json().catch(() => null)) as { error?: string } | null;

      if (!verifyResponse.ok) {
        throw new Error(verifyBody?.error ?? "Couldn't finish setting up that passkey.");
      }

      setStatus("done");
      router.refresh();
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

  function handleRemove(credentialId: string) {
    const formData = new FormData();
    formData.set("credentialId", credentialId);
    startTransition(async () => {
      await deleteGuestCredentialAction(formData);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {credentials.length > 0 ? (
        <ul className="space-y-2">
          {credentials.map((credential) => (
            <li
              key={credential.id}
              className="flex items-center justify-between gap-3 rounded-[20px] bg-[rgba(31,46,39,0.04)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Fingerprint className="h-4 w-4 text-[color:var(--gos-accent)]" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--gos-primary)]">
                    {credential.deviceLabel ?? "Passkey"}
                  </p>
                  <p className="text-xs text-[color:var(--gos-muted)]">
                    Added {credential.createdLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleRemove(credential.id)}
                className="rounded-full p-2 text-[color:var(--gos-muted)] transition-colors hover:bg-[rgba(166,70,70,0.12)] hover:text-[color:var(--gos-error)] disabled:opacity-50"
                aria-label={`Remove ${credential.deviceLabel ?? "passkey"}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[color:var(--gos-muted)]">
          No passkeys yet. Set one up to sign in with Face ID, Touch ID, or Windows Hello instead of an emailed code.
        </p>
      )}

      {status === "done" ? (
        <p className="text-sm text-[color:var(--gos-success)]">Passkey set up.</p>
      ) : null}

      {supported ? (
        <button
          type="button"
          onClick={handleSetUp}
          disabled={status === "registering"}
          className="gos-button-secondary w-full text-sm disabled:opacity-60 sm:w-auto"
        >
          {status === "registering" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Fingerprint className="h-4 w-4" />
          )}
          Set up a passkey
        </button>
      ) : null}

      {error ? <p className="text-sm text-[color:var(--gos-error)]">{error}</p> : null}
    </div>
  );
}
