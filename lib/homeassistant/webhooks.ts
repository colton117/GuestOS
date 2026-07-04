import type {
  HomeAssistantData,
  HomeAssistantWebhookDefinition,
  HomeAssistantWebhookRequest,
  HomeAssistantWebhookResponse,
} from "./types";

export type HomeAssistantWebhookHandlerResult = HomeAssistantWebhookResponse;

export interface HomeAssistantWebhookContext<TPayload = HomeAssistantData> {
  definition: HomeAssistantWebhookDefinition;
  request: HomeAssistantWebhookRequest<TPayload>;
}

export const homeAssistantWebhookBasePath = "/api/homeassistant/webhooks";

export function createHomeAssistantWebhookPath(webhookId: string): string {
  const normalizedWebhookId = webhookId.trim();

  if (!normalizedWebhookId) {
    throw new Error("Home Assistant webhook ID is required.");
  }

  return `${homeAssistantWebhookBasePath}/${encodeURIComponent(normalizedWebhookId)}`;
}

export function createHomeAssistantWebhookDefinition(
  id: string,
  description?: string,
): HomeAssistantWebhookDefinition {
  const path = createHomeAssistantWebhookPath(id);

  return {
    id,
    path,
    description,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isHomeAssistantWebhookRequest<TPayload = HomeAssistantData>(
  value: unknown,
): value is HomeAssistantWebhookRequest<TPayload> {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.webhook_id === "string" &&
    typeof value.event_type === "string" &&
    typeof value.received_at === "string" &&
    "event_data" in value
  );
}

export function parseHomeAssistantWebhookRequest<TPayload = HomeAssistantData>(
  value: unknown,
): HomeAssistantWebhookRequest<TPayload> | null {
  if (!isHomeAssistantWebhookRequest<TPayload>(value)) {
    return null;
  }

  return {
    webhook_id: value.webhook_id,
    event_type: value.event_type,
    event_data: value.event_data,
    received_at: value.received_at,
  };
}

export function createHomeAssistantWebhookAcceptedResponse(
  message?: string,
): HomeAssistantWebhookHandlerResult {
  return {
    accepted: true,
    message,
  };
}

export function createHomeAssistantWebhookRejectedResponse(
  message: string,
): HomeAssistantWebhookHandlerResult {
  return {
    accepted: false,
    message,
  };
}
