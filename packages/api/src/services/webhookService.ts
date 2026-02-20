import type { Webhook, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { err } from "../types";

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
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<Webhook.Response>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks`,
      webhook,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async list(): Promise<Result<Webhook.ListResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.get<Webhook.ListResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async get(id: string): Promise<Result<Webhook.GetResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.get<Webhook.GetResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async update(
    id: string,
    webhook: Webhook.UpdateRequest,
  ): Promise<Result<Webhook.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.put<Webhook.Response>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
      webhook,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async toggle(id: string): Promise<Result<Webhook.Response>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.patch<Webhook.Response>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}/toggle`,
      undefined,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async delete(id: string): Promise<Result<Webhook.DeleteResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.delete<Webhook.DeleteResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async listNotifications(
    params?: Webhook.ListNotificationsQuery,
  ): Promise<Result<Webhook.ListNotificationsResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(params);
    return httpClient.get<Webhook.ListNotificationsResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/notifications${queryString}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async getNotification(
    id: string,
  ): Promise<Result<Webhook.GetNotificationResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.get<Webhook.GetNotificationResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/notifications/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
