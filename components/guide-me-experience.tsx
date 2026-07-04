"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CarFront,
  DoorOpen,
  ExternalLink,
  PersonStanding,
} from "lucide-react";
import { CurrentVisitCountdown } from "@/components/current-visit-countdown";
import {
  getGuideFlow,
  getGuideStepStatus,
  guideFloorOptions,
  guideModeChoices,
  type ArrivalMode,
  type GuideFloorOption,
  type GuideSessionState,
  type GuideStepAction,
} from "@/lib/guide-me";

type GuideMeExperienceProps = {
  guestId: string;
  visitId: string;
  guestName: string;
  propertyName: string;
  arrivalDateTime: string;
};

const storageKeyPrefix = "guestos-guide-me";

function readGuideSessionState(
  key: string,
): GuideSessionState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<GuideSessionState>;

    if (
      parsed &&
      (parsed.mode === null || parsed.mode === "driving" || parsed.mode === "walking") &&
      Array.isArray(parsed.completedStepIds)
    ) {
      return {
        mode: parsed.mode ?? null,
        completedStepIds: parsed.completedStepIds.filter(
          (value): value is string => typeof value === "string",
        ),
        selectedFloor:
          typeof parsed.selectedFloor === "string" &&
          guideFloorOptions.includes(parsed.selectedFloor as GuideFloorOption)
            ? (parsed.selectedFloor as GuideFloorOption)
            : null,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function writeGuideSessionState(key: string, state: GuideSessionState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(key, JSON.stringify(state));
}

function getAppleMapsUrl(destination: string) {
  const query = encodeURIComponent(destination);
  return `https://maps.apple.com/?q=${query}`;
}

function actionTone(status: "idle" | "opening" | "opened" | "failed") {
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

function actionLabel(status: "idle" | "opening" | "opened" | "failed") {
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

export function GuideMeExperience({
  guestId,
  visitId,
  guestName,
  propertyName,
  arrivalDateTime,
}: GuideMeExperienceProps) {
  const storageKey = `${storageKeyPrefix}:${guestId}:${visitId}`;
  const [hydrated, setHydrated] = useState(false);
  const [sessionState, setSessionState] = useState<GuideSessionState>({
    mode: null,
    completedStepIds: [],
    selectedFloor: null,
  });
  const [actionState, setActionState] = useState<{
    status: "idle" | "opening" | "opened" | "failed";
    reason: string | null;
  }>({
    status: "idle",
    reason: null,
  });

  useEffect(() => {
    const stored = readGuideSessionState(storageKey);

    if (stored) {
      setSessionState(stored);
    }

    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeGuideSessionState(storageKey, sessionState);
  }, [hydrated, sessionState, storageKey]);

  const flow = useMemo(() => getGuideFlow(sessionState.mode), [sessionState.mode]);
  const currentStep = useMemo(
    () => (flow ? flow.steps[sessionState.completedStepIds.length] ?? null : null),
    [flow, sessionState.completedStepIds],
  );
  const currentStepIndex = flow ? sessionState.completedStepIds.length : -1;
  const remainingSteps = flow ? flow.steps.slice(currentStepIndex + 1) : [];

  useEffect(() => {
    setActionState({ status: "idle", reason: null });
  }, [currentStep?.id]);

  function resetFlow() {
    setActionState({ status: "idle", reason: null });
    setSessionState({
      mode: null,
      completedStepIds: [],
      selectedFloor: null,
    });
  }

  function chooseMode(mode: ArrivalMode) {
    setActionState({ status: "idle", reason: null });
    setSessionState({
      mode,
      completedStepIds: [],
      selectedFloor: null,
    });
  }

  function completeCurrentStep() {
    if (!currentStep) {
      return;
    }

    setActionState({ status: "idle", reason: null });
    setSessionState((current) => ({
      ...current,
      completedStepIds: current.completedStepIds.includes(currentStep.id)
        ? current.completedStepIds
        : [...current.completedStepIds, currentStep.id],
    }));
  }

  async function runPrimaryAction(action: GuideStepAction) {
    setActionState({ status: "opening", reason: null });

    if (action.kind === "open_maps") {
      window.open(getAppleMapsUrl(action.destination), "_blank", "noopener,noreferrer");
      setActionState({ status: "opened", reason: null });
      return;
    }

    if (action.kind === "complete") {
      completeCurrentStep();
      setActionState({ status: "opened", reason: null });
      return;
    }

    try {
      const response = await fetch(`/api/access/${action.accessPoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const payload = (await response.json()) as {
        reason?: string;
        success?: boolean;
      };

      if (!response.ok || payload.success !== true) {
        setActionState({
          status: "failed",
          reason:
            payload.reason ??
            "This access point is not available for your visit.",
        });
        return;
      }

      completeCurrentStep();
      setActionState({ status: "opened", reason: null });
    } catch {
      setActionState({
        status: "failed",
        reason: "Unable to reach building access. Please try again.",
      });
    }
  }

  const summaryLabel = flow ? `${currentStepIndex + 1} of ${flow.steps.length}` : "Step 1";

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="gos-card overflow-hidden gos-fade-in">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden px-6 py-7 sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[rgba(31,46,39,0.03)]" />
            <div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-[rgba(168,138,90,0.16)] blur-3xl" />
            <div className="relative space-y-5">
              <p className="gos-badge">Guide Me</p>
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-[color:var(--gos-muted)]">
                  Guided arrival
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-6xl">
                  {propertyName}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)] sm:text-lg">
                  We&apos;ll walk you through arrival step by step. The map will plug
                  into these same steps once it&apos;s ready.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="gos-panel p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                    Guest
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--gos-primary)]">
                    {guestName}
                  </p>
                </div>
                <div className="gos-panel p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                    Arrival
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--gos-primary)]">
                    <CurrentVisitCountdown arrivalDateTime={arrivalDateTime} />
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.7)] px-6 py-7 sm:px-8 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="gos-section-title text-[0.72rem] font-semibold">
                    Progress
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
                    Your arrival
                  </h2>
                </div>
                {flow ? (
                  <button className="gos-button-ghost text-xs" type="button" onClick={resetFlow}>
                    Reset
                  </button>
                ) : null}
              </div>

              {flow ? (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                    {flow.intro}
                  </p>
                  <div className="gos-panel p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-[rgba(31,46,39,0.06)]">
                        {flow.mode === "driving" ? (
                          <CarFront className="h-5 w-5 text-[color:var(--gos-primary)]" />
                        ) : (
                          <PersonStanding className="h-5 w-5 text-[color:var(--gos-primary)]" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                          {flow.title}
                        </p>
                        <p className="text-sm text-[color:var(--gos-muted)]">
                          {summaryLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {guideModeChoices.map((choice) => {
                    const Icon = choice.icon;
                    const active = sessionState.mode === choice.mode;

                    return (
                      <button
                        key={choice.mode}
                        type="button"
                        onClick={() => chooseMode(choice.mode)}
                        className={`gos-panel flex items-start gap-4 p-5 text-left transition-transform duration-[180ms] hover:-translate-y-0.5 ${
                          active ? "ring-1 ring-[rgba(31,46,39,0.18)]" : ""
                        }`}
                      >
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[24px] bg-[rgba(31,46,39,0.06)]">
                          <Icon className="h-6 w-6 text-[color:var(--gos-primary)]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-base font-semibold text-[color:var(--gos-primary)]">
                            {choice.title}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-[color:var(--gos-muted)]">
                            {choice.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {flow && currentStep ? (
        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="gos-card overflow-hidden">
            <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="gos-section-title text-[0.72rem] font-semibold">
                  Steps
                </h2>
                <span className="gos-badge">
                  {summaryLabel}
                </span>
              </div>
            </div>
            <div className="space-y-3 p-5 sm:p-6">
              {flow.steps.map((step, index) => {
                const Icon = step.icon;
                const status = getGuideStepStatus(index, sessionState.completedStepIds);

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 rounded-[28px] border p-4 transition-all duration-[180ms] ${
                      status === "current"
                        ? "border-[rgba(31,46,39,0.16)] bg-white shadow-sm"
                        : "border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.72)]"
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[22px] bg-[rgba(31,46,39,0.06)]">
                      {status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-[color:var(--gos-success)]" />
                      ) : (
                        <Icon className="h-5 w-5 text-[color:var(--gos-primary)]" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                          {step.title}
                        </p>
                        <span className={`gos-badge ${actionTone(status === "current" ? actionState.status : status === "completed" ? "opened" : "idle")}`}>
                          {status === "completed"
                            ? "Completed"
                            : status === "current"
                              ? "Current"
                              : "Upcoming"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--gos-muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <section className="gos-card overflow-hidden">
              <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
                <h2 className="gos-section-title text-[0.72rem] font-semibold">
                  Current Step
                </h2>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[26px] bg-[rgba(31,46,39,0.06)]">
                    {(() => {
                      const Icon = currentStep.icon;
                      return <Icon className="h-6 w-6 text-[color:var(--gos-primary)]" />;
                    })()}
                  </span>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="gos-badge">{actionLabel(actionState.status)}</span>
                      <span className="gos-badge bg-[rgba(168,138,90,0.14)] text-[color:var(--gos-accent)]">
                        Step {summaryLabel}
                      </span>
                    </div>
                    <h3 className="text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
                      {currentStep.title}
                    </h3>
                    <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)]">
                      {currentStep.description}
                    </p>
                  </div>
                </div>

                {currentStep.floorPrompt ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                      {currentStep.floorPrompt}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {guideFloorOptions.map((floor) => {
                        const selected = sessionState.selectedFloor === floor;

                        return (
                          <button
                            key={floor}
                            type="button"
                            onClick={() =>
                              setSessionState((current) => ({
                                ...current,
                                selectedFloor: floor,
                              }))
                            }
                            className={`rounded-[26px] border px-4 py-4 text-left transition-transform duration-[180ms] hover:-translate-y-0.5 ${
                              selected
                                ? "border-[color:var(--gos-primary)] bg-white shadow-sm"
                                : "border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.72)]"
                            }`}
                          >
                            <span className="block text-base font-semibold text-[color:var(--gos-primary)]">
                              {floor}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {sessionState.selectedFloor ? (
                      <p className="text-sm text-[color:var(--gos-success)]">
                        Floor stored in session: {sessionState.selectedFloor}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void runPrimaryAction(currentStep.action)}
                    disabled={actionState.status === "opening"}
                    className="gos-button-primary w-full sm:w-auto"
                  >
                    {currentStep.action.kind === "open_maps" ? (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        {currentStep.action.label}
                      </>
                    ) : currentStep.action.kind === "open_access" ? (
                      <>
                        <DoorOpen className="h-4 w-4" />
                        {currentStep.action.label}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {currentStep.action.label}
                      </>
                    )}
                  </button>
                  {currentStep.action.kind === "open_maps" || currentStep.action.kind === "complete" ? (
                    <button
                      type="button"
                      onClick={completeCurrentStep}
                      className="gos-button-secondary w-full sm:w-auto"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Mark Complete
                    </button>
                  ) : null}
                </div>

                {actionState.reason ? (
                  <p className="text-sm leading-6 text-[color:var(--gos-error)]">
                    {actionState.reason}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="gos-card overflow-hidden">
              <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
                <h2 className="gos-section-title text-[0.72rem] font-semibold">
                  Upcoming
                </h2>
              </div>
              <div className="space-y-3 p-5 sm:p-6">
                {remainingSteps.length > 0 ? (
                  remainingSteps.map((step) => (
                    <div
                      key={step.id}
                      className="gos-panel flex items-center gap-4 p-4"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[22px] bg-[rgba(31,46,39,0.06)]">
                        <step.icon className="h-5 w-5 text-[color:var(--gos-primary)]" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                          {step.title}
                        </p>
                        <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="gos-panel p-5">
                    <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                      You&apos;ve reached the last step.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      ) : null}

      <section className="gos-card overflow-hidden">
        <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
          <h2 className="gos-section-title text-[0.72rem] font-semibold">
            Next Step
          </h2>
        </div>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-1">
            <p className="text-base font-semibold text-[color:var(--gos-primary)]">
              {flow && currentStep
                ? currentStep.title
                : "Select an arrival type to begin"}
            </p>
            <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
              {flow && currentStep
                ? "An interactive map is coming soon."
                : "Choose a route, then continue step by step."}
            </p>
          </div>
          <Link href="/current-visit" className="gos-button-secondary w-full sm:w-auto">
            Back to Current Visit
          </Link>
        </div>
      </section>
    </div>
  );
}
