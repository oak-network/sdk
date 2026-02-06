import { RetryOptions } from "./defaultRetryConfig";
import { withRetry } from "./retryHandler";
import { err, ok, Result } from "../types";
import { ApiError, NetworkError, OakError, ParseError } from "./errorHandler";

export interface HttpClientConfig {
  headers?: Record<string, string>;
  retryOptions: RetryOptions;
  signal?: AbortSignal;
}

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

const mergeHeaders = (headers?: Record<string, string>) => ({
  "Content-Type": "application/json",
  "Oak-Version": oakVersion,
  ...(headers ?? {}),
});

const parseResponseBody = async (response: Response) => {
  const body = await response.json();
  return body ?? {};
};

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

const toApiError = (response: Response, responseBody: unknown) => {
  const message = (responseBody as { msg?: string }).msg ?? "HTTP error";
  const headers = toHeadersRecord(response.headers);
  return new ApiError(message, response.status, responseBody, headers);
};

const toOakError = (error: unknown): OakError => {
  if (error instanceof OakError) {
    return error;
  }
  if (error instanceof Error) {
    return new OakError(error.message, error);
  }
  return new OakError("Unknown error", error);
};

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
        throw new NetworkError("Network error", error);
      }

      let parsedBody: unknown;
      try {
        parsedBody = await parseResponseBody(response);
      } catch (error) {
        throw new ParseError("Failed to parse response body", error);
      }

      if (!response.ok) {
        throw toApiError(response, parsedBody);
      }

      return parsedBody as T;
    }, config.retryOptions);

    return ok(responseBody);
  } catch (error) {
    return err(toOakError(error));
  }
};

export const httpClient = {
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
  async get<T>(url: string, config: HttpClientConfig): Promise<Result<T, OakError>> {
    return request<T>(url, config, { method: "GET" });
  },
  async delete<T>(
    url: string,
    config: HttpClientConfig
  ): Promise<Result<T, OakError>> {
    return request<T>(url, config, { method: "DELETE" });
  },
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
