"use client";

import { useState } from "react";
import {
  Building2,
  CarFront,
  ChevronRight,
  DoorOpen,
  KeyRound,
  LoaderCircle,
  MapPinned,
  Store,
  Waypoints,
} from "lucide-react";
import {
  getAccessPointDefinitions,
  type AccessPointSlug,
} from "@/lib/access-definitions";

type AccessCardStatus = "idle" | "opening" | "opened" | "failed";

interface AccessCardState {
  status: AccessCardStatus;
  reason?: string;
}

const iconBySlug: Record<AccessPointSlug, typeof KeyRound> = {
  "vehicle-gate": KeyRound,
  "pool-gate": Store,
  "loading-dock": MapPinned,
  "garage-pedestrian": CarFront,
  "knight-pedestrian": Building2,
  "garage-elevator": Waypoints,
  "leasing-office": DoorOpen,
  stairwell: ChevronRight,
};

function statusTone(status: AccessCardStatus) {
  switch (status) {
    case "opening":
      return "bg-[rgba(168,138,90,0.14)] text-[color:var(--gos-accent)]";
    case "opened":
      return "bg-[rgba(62,107,78,0.12)] text-[color:var(--gos-success)]";
    case "failed":
      return "bg-[rgba(166,70,70,0.12)] text-[color:var(--gos-error)]";
    default:
      return "bg-[rgba(31,46,39,0.08)] text-[color:var(--gos-primary)]";
  }
}

function statusLabel(status: AccessCardStatus) {
  switch (status) {
    case "opening":
      return "Opening...";
    case "opened":
      return "Opened";
    case "failed":
      return "Failed";
    default:
      return "Idle";
  }
}

export function CurrentVisitAccessActions() {
  const accessPoints = getAccessPointDefinitions();
  const [states, setStates] = useState<Record<AccessPointSlug, AccessCardState>>(
    () =>
      accessPoints.reduce<Record<AccessPointSlug, AccessCardState>>(
        (accumulator, accessPoint) => {
          accumulator[accessPoint.slug] = { status: "idle" };
          return accumulator;
        },
        {} as Record<AccessPointSlug, AccessCardState>,
      ),
  );

  async function openAccessPoint(slug: AccessPointSlug) {
    setStates((current) => ({
      ...current,
      [slug]: { status: "opening" },
    }));

    try {
      const response = await fetch(`/api/access/${slug}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const payload = (await response.json()) as {
        reason?: string;
        success?: boolean;
      };

      const success = response.ok && payload.success === true;
      const reason = payload.reason ?? (success ? "Access command sent to Home Assistant." : undefined);

      setStates((current) => ({
        ...current,
        [slug]: {
          status: success ? "opened" : "failed",
          reason:
            reason ??
            "Unable to reach building access. Please try again.",
        },
      }));
    } catch {
      setStates((current) => ({
        ...current,
        [slug]: {
          status: "failed",
          reason: "Unable to reach building access. Please try again.",
        },
      }));
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {accessPoints.map((accessPoint) => {
        const Icon = iconBySlug[accessPoint.slug];
        const cardState = states[accessPoint.slug];
        const isOpening = cardState.status === "opening";

        return (
          <button
            key={accessPoint.slug}
            type="button"
            className="gos-panel flex w-full items-center gap-4 p-5 text-left transition-transform duration-[180ms] hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-100"
            onClick={() => {
              if (!isOpening) {
                void openAccessPoint(accessPoint.slug);
              }
            }}
            disabled={isOpening}
            aria-busy={isOpening}
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[26px] bg-[rgba(31,46,39,0.06)]">
              {isOpening ? (
                <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--gos-accent)]" />
              ) : (
                <Icon className="h-6 w-6 text-[color:var(--gos-primary)]" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="block text-base font-semibold text-[color:var(--gos-primary)]">
                  {accessPoint.title}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${statusTone(cardState.status)}`}
                  aria-live="polite"
                >
                  {statusLabel(cardState.status)}
                </span>
              </span>
              <span className="mt-1 block text-sm leading-6 text-[color:var(--gos-muted)]">
                {accessPoint.description}
              </span>
              {cardState.status === "failed" && cardState.reason ? (
                <span className="mt-2 block text-xs leading-5 text-[color:var(--gos-error)]">
                  {cardState.reason}
                </span>
              ) : null}
              {cardState.status === "opened" ? (
                <span className="mt-2 block text-xs leading-5 text-[color:var(--gos-success)]">
                  Access command sent to Home Assistant.
                </span>
              ) : null}
            </span>
            <ChevronRight className="ml-auto h-5 w-5 text-[color:var(--gos-muted)]" />
          </button>
        );
      })}
    </div>
  );
}
