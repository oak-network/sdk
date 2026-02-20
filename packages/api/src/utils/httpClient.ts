import { RetryOptions } from "./defaultRetryConfig";
import { withRetry } from "./retryHandler";
import { err, ok, Result } from "../types";
import { AbortError, ApiError, NetworkError, OakError, ParseError } from "./errorHandler";

export interface HttpClientConfig {
  headers?: Record<string, string>;
  retryOptions: RetryOptions;
  signal?: AbortSignal;
}

/**
 * @returns Package version string or undefined
 */
const getPackageVersion = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("../../package.json") as { version?: string };
    return pkg.version;
  } catch {
    return undefined;
  }
};

const oakVersion = process.env.OAK_VERSION ?? getPackageVersion() ?? "unknown";

/**
 * @param headers - Optional custom headers to merge
 * @returns Merged headers with defaults
 */
const mergeHeaders = (headers?: Record<string, string>) => ({
  "Content-Type": "application/json",
  "Oak-Version": oakVersion,
  ...(headers ?? {}),
});

type ParseResult = 
  | { success: true; data: unknown; error?: undefined }
  | { success: false; data?: undefined; error: Error };

/**
 * @param text - JSON string to parse
 * @returns ParseResult with parsed data or error
 */
const parseJsonSafe = (text: string): ParseResult => {
  try {
    return { success: true, data: JSON.parse(text) };
  } catch (error) {
    /* istanbul ignore next -- defensive: JSON.parse always throws Error */
    const err = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: err };
  }
};

/**
 * @param headers - Fetch API Headers object
 * @returns Plain object with lowercase header keys
 */
const toHeadersRecord = (headers?: Headers): Record<string, string> => {
  const record: Record<string, string> = {};
  if (!headers) {
    return record;
  }
  headers.forEach((value, key) => {
    record[key.toLowerCase()] = value;
  });
  return record;
};

/**
 * @param response - Fetch API Response object
 * @param responseBody - Parsed response body
 * @returns ApiError with status, body, and headers
 */
const toApiError = (response: Response, responseBody: unknown) => {
  const message = (responseBody as { msg?: string }).msg ?? "HTTP error";
  const headers = toHeadersRecord(response.headers);
  return new ApiError(message, response.status, responseBody, headers);
};

/**
 * @param error - Any thrown error
 * @returns Normalized OakError instance
 */
const toOakError = (error: unknown): OakError => {
  if (error instanceof OakError) {
    return error;
  }
  if (error instanceof Error) {
    return new OakError(error.message, error);
  }
  return new OakError("Unknown error", error);
};

/**
 * @typeParam T - Expected response body type
 * @param url - Request URL
 * @param config - HTTP client configuration
 * @param init - Fetch RequestInit options
 * @returns Result containing parsed response or error
 */
const request = async <T>(
  url: string,
  config: HttpClientConfig,
  init: RequestInit
): Promise<Result<T, OakError>> => {
  try {
    const responseBody = await withRetry(async () => {
      let response: Response;
      try {
        response = await fetch(url, {
          ...init,
          headers: mergeHeaders(config.headers),
          signal: config.signal,
        });
      } catch (error) {
        if (
          config.signal?.aborted ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          throw new AbortError("Request aborted", error);
        }
        throw new NetworkError("Network error", error);
      }

      const text = await response.text();
      const parseResult: ParseResult = text ? parseJsonSafe(text) : { success: true, data: {} };

      if (!response.ok) {
        const body = parseResult.success ? (parseResult.data ?? {}) : { rawText: text };
        throw toApiError(response, body);
      }

      if (!parseResult.success) {
        throw new ParseError("Failed to parse response body", parseResult.error);
      }

      return parseResult.data as T;
    }, { ...config.retryOptions, signal: config.signal });

    return ok(responseBody);
  } catch (error) {
    return err(toOakError(error));
  }
};

export const httpClient = {
  /**
   * @typeParam T - Expected response body type
   * @param url - Request URL
   * @param data - Request body data
   * @param config - HTTP client configuration
   * @returns Result containing parsed response or error
   */
  async post<T>(
    url: string,
    data: any,
    config: HttpClientConfig
  ): Promise<Result<T, OakError>> {
    return request<T>(url, config, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  /**
   * @typeParam T - Expected response body type
   * @param url - Request URL
   * @param config - HTTP client configuration
   * @returns Result containing parsed response or error
   */
  async get<T>(url: string, config: HttpClientConfig): Promise<Result<T, OakError>> {
    return request<T>(url, config, { method: "GET" });
  },
  /**
   * @typeParam T - Expected response body type
   * @param url - Request URL
   * @param config - HTTP client configuration
   * @returns Result containing parsed response or error
   */
  async delete<T>(
    url: string,
    config: HttpClientConfig
  ): Promise<Result<T, OakError>> {
    return request<T>(url, config, { method: "DELETE" });
  },
  /**
   * @typeParam T - Expected response body type
   * @param url - Request URL
   * @param data - Request body data
   * @param config - HTTP client configuration
   * @returns Result containing parsed response or error
   */
  async put<T>(
    url: string,
    data: any,
    config: HttpClientConfig
  ): Promise<Result<T, OakError>> {
    return request<T>(url, config, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  /**
   * @typeParam T - Expected response body type
   * @param url - Request URL
   * @param data - Request body data
   * @param config - HTTP client configuration
   * @returns Result containing parsed response or error
   */
  async patch<T>(
    url: string,
    data: any,
    config: HttpClientConfig
  ): Promise<Result<T, OakError>> {
    return request<T>(url, config, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },
};
