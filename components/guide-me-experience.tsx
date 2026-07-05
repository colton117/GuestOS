"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CarFront,
  DoorOpen,
  ExternalLink,
  ImageIcon,
  PersonStanding,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
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
  photosByStepId: Record<string, string | null>;
};

const storageKeyPrefix = "guestos-guide-me";

function readGuideSessionState(key: string): GuideSessionState | null {
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

function actionLabel(status: "idle" | "opening" | "opened" | "failed") {
  switch (status) {
    case "opening":
      return "Opening...";
    case "opened":
      return "Opened";
    case "failed":
      return "Failed";
    default:
      return "Ready";
  }
}

export function GuideMeExperience({
  guestId,
  visitId,
  guestName,
  propertyName,
  arrivalDateTime,
  photosByStepId,
}: GuideMeExperienceProps) {
  const storageKey = `${storageKeyPrefix}:${guestId}:${visitId}`;
  const [hydrated, setHydrated] = useState(false);
  const [sessionState, setSessionState] = useState<GuideSessionState>({
    mode: null,
    completedStepIds: [],
    selectedFloor: null,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);
  const [showingPhoto, setShowingPhoto] = useState(false);
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
  const liveStepIndex = flow ? sessionState.completedStepIds.length : -1;
  const viewedStep = flow ? flow.steps[viewIndex] ?? null : null;
  const summaryLabel = flow ? `${liveStepIndex + 1} of ${flow.steps.length}` : "Step 1";

  useEffect(() => {
    setActionState({ status: "idle", reason: null });
    setShowingPhoto(false);
  }, [viewedStep?.id]);

  function resetFlow() {
    setModalOpen(false);
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
    setViewIndex(0);
    setModalOpen(true);
  }

  function openGuideModal() {
    setViewIndex(liveStepIndex);
    setModalOpen(true);
  }

  function completeCurrentStep() {
    if (!viewedStep) {
      return;
    }

    setSessionState((current) => {
      const nextCompleted = current.completedStepIds.includes(viewedStep.id)
        ? current.completedStepIds
        : [...current.completedStepIds, viewedStep.id];
      return { ...current, completedStepIds: nextCompleted };
    });
    setViewIndex((index) => index + 1);
  }

  async function runPrimaryAction(action: GuideStepAction) {
    setActionState({ status: "opening", reason: null });

    if (action.kind === "open_maps") {
      window.open(getAppleMapsUrl(action.destination), "_blank", "noopener,noreferrer");
      setActionState({ status: "opened", reason: null });
      completeCurrentStep();
      return;
    }

    if (action.kind === "complete") {
      setActionState({ status: "opened", reason: null });
      completeCurrentStep();
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

      setActionState({ status: "opened", reason: null });
      completeCurrentStep();
    } catch {
      setActionState({
        status: "failed",
        reason: "Unable to reach building access. Please try again.",
      });
    }
  }

  const isViewingLiveStep = flow ? viewIndex === liveStepIndex : false;
  const isViewingCompletedStep = flow ? viewIndex < liveStepIndex : false;
  const allStepsComplete = flow ? liveStepIndex >= flow.steps.length : false;
  const photoSrc = viewedStep ? photosByStepId[viewedStep.id] ?? null : null;

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
                  We&apos;ll walk you through arrival one step at a time.
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
                <div className="space-y-4">
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
                          {allStepsComplete ? "All steps complete" : summaryLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {flow.steps.map((step, index) => {
                      const status = getGuideStepStatus(index, sessionState.completedStepIds);
                      return (
                        <span
                          key={step.id}
                          title={step.title}
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                            status === "completed"
                              ? "bg-[rgba(62,107,78,0.15)] text-[color:var(--gos-success)]"
                              : status === "current"
                                ? "bg-[color:var(--gos-primary)] text-white"
                                : "bg-[rgba(31,46,39,0.06)] text-[color:var(--gos-muted)]"
                          }`}
                        >
                          {status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={openGuideModal}
                    className="gos-button-primary w-full"
                  >
                    <ArrowRight className="h-4 w-4" />
                    {allStepsComplete ? "Review Steps" : "Continue Guide"}
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {guideModeChoices.map((choice) => {
                    const Icon = choice.icon;

                    return (
                      <button
                        key={choice.mode}
                        type="button"
                        onClick={() => chooseMode(choice.mode)}
                        className="gos-panel flex items-start gap-4 p-5 text-left transition-transform duration-[180ms] hover:-translate-y-0.5"
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

      <div className="flex justify-end">
        <Link href="/current-visit" className="gos-button-secondary">
          Back to Overview
        </Link>
      </div>

      <Modal
        open={modalOpen && Boolean(flow)}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={flow ? `${flow.title} · ${allStepsComplete ? "Complete" : summaryLabel}` : undefined}
      >
        {allStepsComplete ? (
          <div className="space-y-5 py-4 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(62,107,78,0.12)]">
              <CheckCircle2 className="h-8 w-8 text-[color:var(--gos-success)]" />
            </span>
            <h3 className="text-2xl font-semibold text-[color:var(--gos-primary)]">
              You&apos;re all set
            </h3>
            <p className="text-base leading-7 text-[color:var(--gos-muted)]">
              Every step is complete. Enjoy your stay at {propertyName}.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="gos-button-primary mx-auto"
            >
              Done
            </button>
          </div>
        ) : viewedStep && showingPhoto ? (
          <div className="space-y-4">
            {photoSrc ? (
              <Image
                src={photoSrc}
                alt={viewedStep.title}
                width={800}
                height={600}
                unoptimized
                className="w-full rounded-lg border border-[rgba(31,46,39,0.08)] object-cover"
              />
            ) : null}
            <button
              type="button"
              onClick={() => setShowingPhoto(false)}
              className="gos-button-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Step
            </button>
          </div>
        ) : viewedStep ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[26px] bg-[rgba(31,46,39,0.06)]">
                <viewedStep.icon className="h-6 w-6 text-[color:var(--gos-primary)]" />
              </span>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {isViewingCompletedStep ? (
                    <span className="gos-badge bg-[rgba(62,107,78,0.12)] text-[color:var(--gos-success)]">
                      Completed
                    </span>
                  ) : (
                    <span className="gos-badge">{actionLabel(actionState.status)}</span>
                  )}
                  <span className="gos-badge bg-[rgba(168,138,90,0.14)] text-[color:var(--gos-accent)]">
                    Step {viewIndex + 1} of {flow?.steps.length}
                  </span>
                </div>
                <h3 className="text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
                  {viewedStep.title}
                </h3>
                <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)]">
                  {viewedStep.description}
                </p>
              </div>
            </div>

            {photoSrc ? (
              <button
                type="button"
                onClick={() => setShowingPhoto(true)}
                className="gos-button-secondary"
              >
                <ImageIcon className="h-4 w-4" />
                View Photo
              </button>
            ) : null}

            {isViewingLiveStep && viewedStep.floorPrompt ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                  {viewedStep.floorPrompt}
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
              </div>
            ) : null}

            {isViewingLiveStep && actionState.reason ? (
              <p className="text-sm leading-6 text-[color:var(--gos-error)]">
                {actionState.reason}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t border-[rgba(31,46,39,0.08)] pt-5">
              <button
                type="button"
                onClick={() => setViewIndex((index) => Math.max(0, index - 1))}
                disabled={viewIndex === 0}
                className="gos-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {isViewingCompletedStep ? (
                <button
                  type="button"
                  onClick={() => setViewIndex((index) => index + 1)}
                  className="gos-button-primary"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void runPrimaryAction(viewedStep.action)}
                  disabled={actionState.status === "opening"}
                  className="gos-button-primary"
                >
                  {viewedStep.action.kind === "open_maps" ? (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      {viewedStep.action.label}
                    </>
                  ) : viewedStep.action.kind === "open_access" ? (
                    <>
                      <DoorOpen className="h-4 w-4" />
                      {viewedStep.action.label}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {viewedStep.action.label}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
