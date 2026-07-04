export const homeAssistantEntityDomains = [
  "input_boolean",
  "input_button",
  "input_text",
  "input_number",
  "switch",
  "lock",
  "cover",
  "script",
  "automation",
  "sensor",
] as const;

export type HomeAssistantEntityDomain =
  (typeof homeAssistantEntityDomains)[number];

export type HomeAssistantEntityId =
  `${HomeAssistantEntityDomain}.${string}`;

export type HomeAssistantActionName =
  | "approveVisit"
  | "denyVisit"
  | "openGate"
  | "closeGate"
  | "unlockDoor"
  | "lockDoor"
  | "toggleHelper"
  | "runScript"
  | "triggerAutomation";

export type HomeAssistantJsonValue =
  | string
  | number
  | boolean
  | null
  | HomeAssistantJsonValue[]
  | { [key: string]: HomeAssistantJsonValue };

export type HomeAssistantData = Record<string, unknown>;

export interface HomeAssistantStateAttributes {
  [key: string]: unknown;
}

export interface HomeAssistantState<
  TAttributes extends HomeAssistantStateAttributes = HomeAssistantStateAttributes,
> {
  entity_id: HomeAssistantEntityId | string;
  state: string;
  attributes: TAttributes;
  last_changed: string;
  last_updated: string;
  context?: {
    id?: string;
    parent_id?: string | null;
    user_id?: string | null;
  };
}

export interface HomeAssistantServiceInvocation {
  domain: string;
  service: string;
  data?: HomeAssistantData;
}

export type HomeAssistantActionInvocation = HomeAssistantServiceInvocation;

export interface HomeAssistantWebhookDefinition {
  id: string;
  path: string;
  description?: string;
}

export interface HomeAssistantWebhookRequest<TPayload = HomeAssistantData> {
  webhook_id: string;
  event_type: string;
  event_data: TPayload;
  received_at: string;
}

export interface HomeAssistantWebhookResponse {
  accepted: boolean;
  message?: string;
}

export interface HomeAssistantConfig {
  baseUrl: string;
  token: string;
}

export interface HomeAssistantRequestOptions {
  fetchImpl?: typeof fetch;
  logger?: Pick<Console, "error" | "warn" | "info">;
}

export interface HomeAssistantActionTarget {
  domain: string;
  service: string;
  data?: HomeAssistantData;
}
