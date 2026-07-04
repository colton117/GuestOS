import { HomeAssistantClient, HomeAssistantError } from "./client";
import type {
  HomeAssistantActionName,
  HomeAssistantActionTarget,
  HomeAssistantData,
} from "./types";

const homeAssistantActionNames: HomeAssistantActionName[] = [
  "approveVisit",
  "denyVisit",
  "openGate",
  "closeGate",
  "unlockDoor",
  "lockDoor",
  "toggleHelper",
  "runScript",
  "triggerAutomation",
];

export interface HomeAssistantActionConfig extends HomeAssistantActionTarget {
  enabled?: boolean;
}

export interface HomeAssistantServiceLayerConfig {
  approveVisit?: HomeAssistantActionConfig;
  denyVisit?: HomeAssistantActionConfig;
  openGate?: HomeAssistantActionConfig;
  closeGate?: HomeAssistantActionConfig;
  unlockDoor?: HomeAssistantActionConfig;
  lockDoor?: HomeAssistantActionConfig;
  toggleHelper?: HomeAssistantActionConfig;
  runScript?: HomeAssistantActionConfig;
  triggerAutomation?: HomeAssistantActionConfig;
}

export interface HomeAssistantActionInvoker {
  invoke(actionName: HomeAssistantActionName, data?: HomeAssistantData): Promise<void>;
}

function toBooleanEnv(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function parseJsonEnv(value: string | undefined, name: string): HomeAssistantData | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Expected an object.");
    }

    return parsed as HomeAssistantData;
  } catch (error) {
    throw new HomeAssistantError(
      `Invalid JSON in ${name}. Expected an object value.`,
      { cause: error },
    );
  }
}

function readActionConfig(
  actionName: HomeAssistantActionName,
): HomeAssistantActionConfig | undefined {
  const prefix = `HOME_ASSISTANT_${actionName.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`;
  const domain = process.env[`${prefix}_DOMAIN`]?.trim();
  const service = process.env[`${prefix}_SERVICE`]?.trim();
  const enabled = toBooleanEnv(process.env[`${prefix}_ENABLED`]);
  const data = parseJsonEnv(process.env[`${prefix}_DATA_JSON`], `${prefix}_DATA_JSON`);

  if (!domain || !service) {
    return undefined;
  }

  return {
    domain,
    service,
    data,
    enabled,
  };
}

export function readHomeAssistantServiceConfigFromEnv(): HomeAssistantServiceLayerConfig {
  return homeAssistantActionNames.reduce<HomeAssistantServiceLayerConfig>(
    (config, actionName) => {
      const actionConfig = readActionConfig(actionName);
      if (actionConfig) {
        config[actionName] = actionConfig;
      }
      return config;
    },
    {},
  );
}

export class HomeAssistantServiceLayer implements HomeAssistantActionInvoker {
  constructor(
    private readonly client: HomeAssistantClient,
    private readonly config: HomeAssistantServiceLayerConfig = readHomeAssistantServiceConfigFromEnv(),
  ) {}

  private getActionConfig(actionName: HomeAssistantActionName): HomeAssistantActionConfig {
    const actionConfig = this.config[actionName];

    if (!actionConfig) {
      throw new HomeAssistantError(
        `Home Assistant action "${actionName}" is not configured. Set HOME_ASSISTANT_${actionName
          .replace(/[A-Z]/g, (letter) => `_${letter}`)
          .toUpperCase()}_DOMAIN and HOME_ASSISTANT_${actionName
          .replace(/[A-Z]/g, (letter) => `_${letter}`)
          .toUpperCase()}_SERVICE.`,
      );
    }

    if (actionConfig.enabled === false) {
      throw new HomeAssistantError(
        `Home Assistant action "${actionName}" is disabled by configuration.`,
      );
    }

    return actionConfig;
  }

  async invoke(actionName: HomeAssistantActionName, data: HomeAssistantData = {}): Promise<void> {
    const actionConfig = this.getActionConfig(actionName);
    await this.client.callService(actionConfig.domain, actionConfig.service, {
      ...(actionConfig.data ?? {}),
      ...data,
    });
  }

  approveVisit(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("approveVisit", data);
  }

  denyVisit(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("denyVisit", data);
  }

  openGate(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("openGate", data);
  }

  closeGate(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("closeGate", data);
  }

  unlockDoor(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("unlockDoor", data);
  }

  lockDoor(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("lockDoor", data);
  }

  toggleHelper(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("toggleHelper", data);
  }

  runScript(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("runScript", data);
  }

  triggerAutomation(data: HomeAssistantData = {}): Promise<void> {
    return this.invoke("triggerAutomation", data);
  }
}

export function createHomeAssistantServiceLayer(
  client: HomeAssistantClient,
  config?: HomeAssistantServiceLayerConfig,
): HomeAssistantServiceLayer {
  return new HomeAssistantServiceLayer(client, config);
}

