import { prisma } from "@/lib/prisma";
import type {
  HomeAssistantConfig,
  HomeAssistantData,
  HomeAssistantRequestOptions,
  HomeAssistantState,
} from "./types";

const DEFAULT_TIMEOUT_SECONDS = 10;

export class HomeAssistantError extends Error {
  override name = "HomeAssistantError";

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export class HomeAssistantOfflineError extends HomeAssistantError {
  override name = "HomeAssistantOfflineError";
}

export class HomeAssistantRequestError extends HomeAssistantError {
  override name = "HomeAssistantRequestError";

  constructor(
    message: string,
    public readonly status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();

  if (!trimmed) {
    throw new HomeAssistantError(
      "HOME_ASSISTANT_URL is not configured. Set it to your Home Assistant base URL.",
    );
  }

  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function readHomeAssistantConfigFromEnv(): HomeAssistantConfig | null {
  const baseUrl = process.env.HOME_ASSISTANT_URL?.trim();
  const token = process.env.HOME_ASSISTANT_TOKEN?.trim();

  if (!baseUrl || !token) {
    return null;
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    token,
  };
}

function formatRequestMessage(
  method: string,
  url: string,
  details: string,
): string {
  return `Home Assistant ${method} ${url} failed: ${details}`;
}

function isFetchOfflineError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("networkerror") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("eai_again") ||
    message.includes("socket hang up") ||
    message.includes("connection refused")
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as unknown;
  }

  const text = await response.text();
  return text.length > 0 ? text : undefined;
}

export interface HomeAssistantClientOptions extends HomeAssistantRequestOptions {
  baseUrl?: string;
  token?: string;
  timeoutMs?: number;
}

export class HomeAssistantClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly logger: Pick<Console, "error" | "warn" | "info">;

  constructor(options: HomeAssistantClientOptions = {}) {
    const envConfig = readHomeAssistantConfigFromEnv();
    const baseUrl = options.baseUrl ?? envConfig?.baseUrl;
    const token = options.token ?? envConfig?.token;

    if (!baseUrl || !token) {
      throw new HomeAssistantError(
        "Home Assistant is not configured. Set HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN.",
      );
    }

    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.token = token;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_SECONDS * 1000;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.logger = options.logger ?? console;
  }

  static fromEnv(options: HomeAssistantRequestOptions = {}): HomeAssistantClient {
    return new HomeAssistantClient(options);
  }

  private buildUrl(pathname: string): string {
    return new URL(pathname, `${this.baseUrl}/`).toString();
  }

  private buildHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async request<TResponse = unknown>(
    method: "GET" | "POST",
    pathname: string,
    body?: HomeAssistantData,
  ): Promise<TResponse> {
    const url = this.buildUrl(pathname);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers: this.buildHeaders(),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === "TimeoutError";
      const details = isTimeout
        ? `Home Assistant did not respond within ${this.timeoutMs}ms.`
        : isFetchOfflineError(error)
          ? "Home Assistant appears to be offline or unreachable."
          : "The request could not be completed.";
      const wrappedError = isTimeout
        ? new HomeAssistantOfflineError(formatRequestMessage(method, url, details), {
            cause: error,
          })
        : isFetchOfflineError(error)
          ? new HomeAssistantOfflineError(formatRequestMessage(method, url, details), {
              cause: error,
            })
          : new HomeAssistantRequestError(formatRequestMessage(method, url, details), undefined, {
              cause: error,
            });

      this.logger.error(wrappedError.message, error);
      throw wrappedError;
    }

    if (!response.ok) {
      const responseBody = await parseResponseBody(response);
      const bodyText =
        typeof responseBody === "string"
          ? responseBody
          : responseBody === undefined
            ? "no response body"
            : JSON.stringify(responseBody);

      const error = new HomeAssistantRequestError(
        formatRequestMessage(
          method,
          url,
          `received HTTP ${response.status} ${response.statusText || ""}`.trim() +
            ` (${bodyText})`,
        ),
        response.status,
      );

      this.logger.error(error.message);
      throw error;
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    const parsedBody = await parseResponseBody(response);
    return parsedBody as TResponse;
  }

  async getState<TAttributes extends Record<string, unknown> = Record<string, unknown>>(
    entityId: string,
  ): Promise<HomeAssistantState<TAttributes> | null> {
    const normalizedEntityId = entityId.trim();

    if (!normalizedEntityId) {
      throw new HomeAssistantError("Home Assistant entity ID is required.");
    }

    try {
      return await this.request<HomeAssistantState<TAttributes>>(
        "GET",
        `/api/states/${encodeURIComponent(normalizedEntityId)}`,
      );
    } catch (error) {
      if (error instanceof HomeAssistantRequestError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  async callService(
    domain: string,
    service: string,
    data: HomeAssistantData = {},
  ): Promise<void> {
    const normalizedDomain = domain.trim();
    const normalizedService = service.trim();

    if (!normalizedDomain || !normalizedService) {
      throw new HomeAssistantError(
        "Home Assistant service calls require both a domain and a service.",
      );
    }

    await this.request(
      "POST",
      `/api/services/${encodeURIComponent(normalizedDomain)}/${encodeURIComponent(normalizedService)}`,
      data,
    );
  }

  async fireEvent(
    eventType: string,
    eventData: HomeAssistantData = {},
  ): Promise<void> {
    const normalizedEventType = eventType.trim();

    if (!normalizedEventType) {
      throw new HomeAssistantError("Home Assistant event type is required.");
    }

    await this.request(
      "POST",
      `/api/events/${encodeURIComponent(normalizedEventType)}`,
      eventData,
    );
  }

  /** Hits the Home Assistant root API endpoint to confirm the URL/token are valid. */
  async ping(): Promise<void> {
    await this.request("GET", "/api/");
  }
}

export function createHomeAssistantClient(
  options: HomeAssistantClientOptions = {},
): HomeAssistantClient {
  return new HomeAssistantClient(options);
}

/**
 * Resolves Home Assistant connection details from the admin-managed
 * HomeAssistantSettings DB row, falling back to env vars when the DB
 * fields are unset. This is the source of truth for real HA calls — the
 * `/settings` page writes to the DB, so this must read from it too.
 */
export async function resolveHomeAssistantConfig(): Promise<
  HomeAssistantConfig & { timeoutMs: number }
> {
  const dbSettings = await prisma.homeAssistantSettings.findUnique({
    where: { id: 1 },
  });

  const baseUrl = dbSettings?.haUrl?.trim() || process.env.HOME_ASSISTANT_URL?.trim();
  const token = dbSettings?.haToken?.trim() || process.env.HOME_ASSISTANT_TOKEN?.trim();
  const timeoutSeconds = dbSettings?.webhookTimeout ?? DEFAULT_TIMEOUT_SECONDS;

  if (!baseUrl || !token) {
    throw new HomeAssistantError(
      "Home Assistant is not configured. Set the HA URL and token in Settings.",
    );
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    token,
    timeoutMs: timeoutSeconds * 1000,
  };
}

export async function createHomeAssistantClientFromSettings(): Promise<HomeAssistantClient> {
  const config = await resolveHomeAssistantConfig();
  return new HomeAssistantClient(config);
}

export async function pingHomeAssistant(): Promise<void> {
  const client = await createHomeAssistantClientFromSettings();
  await client.ping();
}
