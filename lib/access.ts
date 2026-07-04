import { HomeAssistantError, HomeAssistantOfflineError, HomeAssistantRequestError } from "@/lib/homeassistant/client";
import { createHomeAssistantClient } from "@/lib/homeassistant/client";
import { createHomeAssistantServiceLayer, type HomeAssistantServiceLayer } from "@/lib/homeassistant/services";
import type { HomeAssistantData } from "@/lib/homeassistant/types";
import {
  getAccessPointDefinition,
  type AccessPointDefinition,
  type AccessPointSlug,
} from "@/lib/access-definitions";
import { getGuestVisitState, type GuestVisitStateVisit } from "@/lib/portal";
import { getSettingsData } from "@/lib/settings-data";

export const ACCESS_UNAUTHORIZED_REASON =
  "This access point is not available for your visit.";
export const ACCESS_UNAVAILABLE_REASON =
  "Unable to reach building access. Please try again.";

export interface AccessAttemptRecord {
  timestamp: string;
  guestId: string | null;
  visitId: string | null;
  door: AccessPointSlug;
  success: boolean;
  reason: string;
}

export interface AccessAttemptResult {
  status: number;
  record: AccessAttemptRecord;
}

export interface AccessServiceOptions {
  homeAssistant?: HomeAssistantServiceLayer;
  getSettingsData?: typeof getSettingsData;
  now?: () => Date;
  logger?: Pick<Console, "error" | "info" | "warn">;
}

function isVisitAccessWindowOpen(
  visit: GuestVisitStateVisit,
  now: Date,
): boolean {
  return (
    visit.arrivalDateTime <= now &&
    (visit.departureDateTime === null || visit.departureDateTime >= now)
  );
}

function isVisitAllowedForAccessPoint(
  visit: GuestVisitStateVisit,
  accessPoint: AccessPointDefinition,
): boolean {
  return accessPoint.requiredVisitFlags.every((flag) => visit[flag]);
}

function toScriptEntityId(homeAssistantAction: string): string {
  const normalized = homeAssistantAction.trim();

  if (!normalized) {
    throw new HomeAssistantError("Home Assistant action is required.");
  }

  if (normalized.startsWith("script.")) {
    return normalized;
  }

  const objectId = normalized.includes(".")
    ? normalized.slice(normalized.indexOf(".") + 1)
    : normalized;

  return `script.${objectId}`;
}

function logAccessAttempt(
  logger: Pick<Console, "error" | "info" | "warn">,
  record: AccessAttemptRecord,
) {
  logger.info("[GuestOS Access]", record);
}

function createAttemptRecord(
  door: AccessPointSlug,
  guestId: string | null,
  visitId: string | null,
  success: boolean,
  reason: string,
  now: Date,
): AccessAttemptRecord {
  return {
    timestamp: now.toISOString(),
    guestId,
    visitId,
    door,
    success,
    reason,
  };
}

function createAccessAttemptResult(
  status: number,
  record: AccessAttemptRecord,
): AccessAttemptResult {
  return { status, record };
}

export class GuestAccessService {
  private readonly homeAssistant: HomeAssistantServiceLayer;
  private readonly getSettingsDataFn: typeof getSettingsData;
  private readonly nowFn: () => Date;
  private readonly logger: Pick<Console, "error" | "info" | "warn">;

  constructor(options: AccessServiceOptions = {}) {
    this.homeAssistant =
      options.homeAssistant ??
      createHomeAssistantServiceLayer(createHomeAssistantClient());
    this.getSettingsDataFn = options.getSettingsData ?? getSettingsData;
    this.nowFn = options.now ?? (() => new Date());
    this.logger = options.logger ?? console;
  }

  async openAccessPoint(
    slug: AccessPointSlug,
    guestId: string,
  ): Promise<AccessAttemptResult> {
    const now = this.nowFn();
    const accessPoint = getAccessPointDefinition(slug);

    if (!accessPoint) {
      const record = createAttemptRecord(
        slug,
        guestId,
        null,
        false,
        ACCESS_UNAUTHORIZED_REASON,
        now,
      );

      logAccessAttempt(this.logger, record);
      return createAccessAttemptResult(403, record);
    }

    const state = await getGuestVisitState(guestId);

    if (state.kind !== "active_visit" || !state.visit) {
      const record = createAttemptRecord(
        slug,
        guestId,
        state.visit?.id ?? null,
        false,
        ACCESS_UNAUTHORIZED_REASON,
        now,
      );

      logAccessAttempt(this.logger, record);
      return createAccessAttemptResult(403, record);
    }

    const visit = state.visit;

    if (!isVisitAccessWindowOpen(visit, now)) {
      const record = createAttemptRecord(
        slug,
        guestId,
        visit.id,
        false,
        ACCESS_UNAUTHORIZED_REASON,
        now,
      );

      logAccessAttempt(this.logger, record);
      return createAccessAttemptResult(403, record);
    }

    if (!isVisitAllowedForAccessPoint(visit, accessPoint)) {
      const record = createAttemptRecord(
        slug,
        guestId,
        visit.id,
        false,
        ACCESS_UNAUTHORIZED_REASON,
        now,
      );

      logAccessAttempt(this.logger, record);
      return createAccessAttemptResult(403, record);
    }

    try {
      const settings = await this.getSettingsDataFn();
      const configuredDoor = settings.doors.find(
        (door) =>
          door.homeAssistantAction.trim() ===
          accessPoint.defaultHomeAssistantAction,
      );

      if (configuredDoor && !configuredDoor.enabled) {
        const record = createAttemptRecord(
          slug,
          guestId,
          visit.id,
          false,
          ACCESS_UNAUTHORIZED_REASON,
          now,
        );

        logAccessAttempt(this.logger, record);
        return createAccessAttemptResult(403, record);
      }

      const homeAssistantAction =
        configuredDoor?.homeAssistantAction.trim() ||
        accessPoint.defaultHomeAssistantAction;
      const scriptEntityId = toScriptEntityId(homeAssistantAction);

      await this.homeAssistant.runScript({
        entity_id: scriptEntityId,
        access_point: slug,
        guest_id: guestId,
        visit_id: visit.id,
        home_assistant_action: homeAssistantAction,
      } as HomeAssistantData);

      const record = createAttemptRecord(
        slug,
        guestId,
        visit.id,
        true,
        "Access command sent to Home Assistant.",
        now,
      );

      logAccessAttempt(this.logger, record);
      return createAccessAttemptResult(200, record);
    } catch (error) {
      const isUnavailable =
        error instanceof HomeAssistantOfflineError ||
        error instanceof HomeAssistantRequestError ||
        error instanceof HomeAssistantError;

      const record = createAttemptRecord(
        slug,
        guestId,
        visit.id,
        false,
        ACCESS_UNAVAILABLE_REASON,
        now,
      );

      if (isUnavailable) {
        this.logger.warn("[GuestOS Access] Home Assistant unavailable.", error);
      } else {
        this.logger.error("[GuestOS Access] Unexpected access failure.", error);
      }

      logAccessAttempt(this.logger, record);
      return createAccessAttemptResult(503, record);
    }
  }
}

export function createGuestAccessService(options: AccessServiceOptions = {}) {
  return new GuestAccessService(options);
}
