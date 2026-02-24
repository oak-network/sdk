import type { Webhook, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface WebhookService {
  register(webhook: Webhook.RegisterRequest): Promise<Result<Webhook.Response>>;
  list(): Promise<Result<Webhook.ListResponse>>;
  get(id: string): Promise<Result<Webhook.GetResponse>>;
  update(
    id: string,
    webhook: Webhook.UpdateRequest,
  ): Promise<Result<Webhook.Response>>;
  toggle(id: string): Promise<Result<Webhook.Response>>;
  delete(id: string): Promise<Result<Webhook.DeleteResponse>>;
  listNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<Webhook.ListNotificationsResponse>>;
  getNotification(id: string): Promise<Result<Webhook.GetNotificationResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns WebhookService instance
 */
export const createWebhookService = (client: OakClient): WebhookService => ({
  async register(
    webhook: Webhook.RegisterRequest,
  ): Promise<Result<Webhook.Response>> {
    return withAuth(client, (token) =>
      httpClient.post<Webhook.Response>(
        buildUrl(client.config.baseUrl, "api/v1/merchant/webhooks"),
        webhook,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async list(): Promise<Result<Webhook.ListResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Webhook.ListResponse>(
        buildUrl(client.config.baseUrl, "api/v1/merchant/webhooks"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async get(id: string): Promise<Result<Webhook.GetResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Webhook.GetResponse>(
        buildUrl(client.config.baseUrl, "api/v1/merchant/webhooks", id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async update(
    id: string,
    webhook: Webhook.UpdateRequest,
  ): Promise<Result<Webhook.Response>> {
    return withAuth(client, (token) =>
      httpClient.put<Webhook.Response>(
        buildUrl(client.config.baseUrl, "api/v1/merchant/webhooks", id),
        webhook,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async toggle(id: string): Promise<Result<Webhook.Response>> {
    return withAuth(client, (token) =>
      httpClient.patch<Webhook.Response>(
        buildUrl(client.config.baseUrl, "api/v1/merchant/webhooks", id, "toggle"),
        undefined,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async delete(id: string): Promise<Result<Webhook.DeleteResponse>> {
    return withAuth(client, (token) =>
      httpClient.delete<Webhook.DeleteResponse>(
        buildUrl(client.config.baseUrl, "api/v1/merchant/webhooks", id),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async listNotifications(
    params?: Webhook.ListNotificationsQuery,
  ): Promise<Result<Webhook.ListNotificationsResponse>> {
    const queryString = buildQueryString(params);
    return withAuth(client, (token) =>
      httpClient.get<Webhook.ListNotificationsResponse>(
        `${buildUrl(client.config.baseUrl, "api/v1/merchant/webhooks/notifications")}${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async getNotification(
    id: string,
  ): Promise<Result<Webhook.GetNotificationResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Webhook.GetNotificationResponse>(
        buildUrl(client.config.baseUrl, "api/v1/merchant/webhooks/notifications", id),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
