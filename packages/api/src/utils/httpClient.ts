import { RetryOptions } from "./defaultRetryConfig";
import { withRetry } from "./retryHandler";

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

const toError = (response: Response, responseBody: unknown) => {
  const message = (responseBody as { msg?: string }).msg ?? "HTTP error";
  const error: any = new Error(message);
  error.status = response.status;
  error.body = responseBody;
  return error;
};

export const httpClient = {
  async post<T>(url: string, data: any, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: mergeHeaders(config.headers),
        body: JSON.stringify(data),
      });

      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        throw toError(response, responseBody);
      }

      return responseBody as T;
    }, config.retryOptions);
  },
  async get<T>(url: string, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "GET",
        headers: mergeHeaders(config.headers),
      });

      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        throw toError(response, responseBody);
      }

      return responseBody as T;
    }, config.retryOptions);
  },
  async delete<T>(url: string, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "DELETE",
        headers: mergeHeaders(config.headers),
      });

      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        throw toError(response, responseBody);
      }

      return responseBody as T;
    }, config.retryOptions);
  },
  async put<T>(url: string, data: any, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "PUT",
        headers: mergeHeaders(config.headers),
        body: JSON.stringify(data),
      });

      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        throw toError(response, responseBody);
      }

      return responseBody as T;
    }, config.retryOptions);
  },
  async patch<T>(url: string, data: any, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "PATCH",
        headers: mergeHeaders(config.headers),
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        throw toError(response, responseBody);
      }

      return responseBody as T;
    }, config.retryOptions);
  },
};
