import type {
  HomeAssistantEntityDomain,
  HomeAssistantEntityId,
} from "./types";
import { homeAssistantEntityDomains } from "./types";

export interface HomeAssistantEntityParts<
  TDomain extends HomeAssistantEntityDomain = HomeAssistantEntityDomain,
> {
  domain: TDomain;
  objectId: string;
  entityId: `${TDomain}.${string}`;
}

function createEntityId<TDomain extends HomeAssistantEntityDomain>(
  domain: TDomain,
  objectId: string,
): `${TDomain}.${string}` {
  const normalizedObjectId = objectId.trim();

  if (!normalizedObjectId) {
    throw new Error(`Home Assistant entity object ID is required for ${domain}.`);
  }

  return `${domain}.${normalizedObjectId}` as `${TDomain}.${string}`;
}

export function isHomeAssistantEntityDomain(
  value: string,
): value is HomeAssistantEntityDomain {
  return homeAssistantEntityDomains.includes(
    value as HomeAssistantEntityDomain,
  );
}

export function parseHomeAssistantEntityId(
  entityId: string,
): HomeAssistantEntityParts | null {
  const separatorIndex = entityId.indexOf(".");

  if (separatorIndex <= 0 || separatorIndex === entityId.length - 1) {
    return null;
  }

  const domain = entityId.slice(0, separatorIndex);
  const objectId = entityId.slice(separatorIndex + 1);

  if (!isHomeAssistantEntityDomain(domain)) {
    return null;
  }

  return {
    domain,
    objectId,
    entityId: `${domain}.${objectId}` as HomeAssistantEntityId,
  };
}

export function normalizeHomeAssistantEntityId(
  entityId: string,
): HomeAssistantEntityId {
  const parsed = parseHomeAssistantEntityId(entityId);

  if (!parsed) {
    throw new Error(
      `Invalid Home Assistant entity ID "${entityId}". Expected one of: ${homeAssistantEntityDomains.join(", ")}.`,
    );
  }

  return parsed.entityId;
}

export function inputBooleanEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("input_boolean", objectId);
}

export function inputButtonEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("input_button", objectId);
}

export function inputTextEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("input_text", objectId);
}

export function inputNumberEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("input_number", objectId);
}

export function switchEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("switch", objectId);
}

export function lockEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("lock", objectId);
}

export function coverEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("cover", objectId);
}

export function scriptEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("script", objectId);
}

export function automationEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("automation", objectId);
}

export function sensorEntity(objectId: string): HomeAssistantEntityId {
  return createEntityId("sensor", objectId);
}

