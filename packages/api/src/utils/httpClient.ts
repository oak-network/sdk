import { RetryOptions } from "./defaultRetryConfig";
import { withRetry } from "./retryHandler";

export interface HttpClientConfig {
  headers?: Record<string, string>;
  retryOptions: RetryOptions;
  signal?: AbortSignal;
}

export const httpClient = {
  async post<T>(url: string, data: any, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        // Attach response body and status to the error
        const error: any = new Error(responseBody?.msg || "HTTP error");
        error.status = response.status;
        error.body = responseBody;
        throw error;
      }

      return responseBody as T;
    }, config.retryOptions);
  },
  async get<T>(url: string, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
      });

      const responseBody = await response.json();

      if (!response.ok) {
        const error: any = new Error(responseBody?.msg || "HTTP error");
        error.status = response.status;
        error.body = responseBody;
        throw error;
      }

      return responseBody as T;
    }, config.retryOptions);
  },
  async delete<T>(url: string, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
      });

      const responseBody = await response.json();

      if (!response.ok) {
        const error: any = new Error(responseBody?.msg || "HTTP error");
        error.status = response.status;
        error.body = responseBody;
        throw error;
      }

      return responseBody as T;
    }, config.retryOptions);
  },
  async put<T>(url: string, data: any, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
        body: JSON.stringify(data),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        const error: any = new Error(responseBody?.msg || "HTTP error");
        error.status = response.status;
        error.body = responseBody;
        throw error;
      }

      return responseBody as T;
    }, config.retryOptions);
  },
  async patch<T>(url: string, data: any, config: HttpClientConfig): Promise<T> {
    return withRetry(async () => {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...config?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseBody = await response.json();

      if (!response.ok) {
        const error: any = new Error(responseBody?.msg || "HTTP error");
        error.status = response.status;
        error.body = responseBody;
        throw error;
      }

      return responseBody as T;
    }, config.retryOptions);
  },
};
