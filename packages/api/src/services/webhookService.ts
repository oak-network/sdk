import type { Webhook, OakClient } from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString, getErrorBodyMessage } from "./helpers";

export interface WebhookService {
  register(webhook: Webhook.RegisterRequest): Promise<Webhook.Response>;
  list(): Promise<Webhook.ListResponse>;
  get(id: string): Promise<Webhook.GetResponse>;
  update(id: string, webhook: Webhook.UpdateRequest): Promise<Webhook.Response>;
  toggle(id: string): Promise<Webhook.Response>;
  delete(id: string): Promise<Webhook.DeleteResponse>;
  listNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Webhook.ListNotificationsResponse>;
  getNotification(id: string): Promise<Webhook.GetNotificationResponse>;
}

export const createWebhookService = (client: OakClient): WebhookService => ({
  async register(webhook: Webhook.RegisterRequest): Promise<Webhook.Response> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.post<Webhook.Response>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks`,
        webhook,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      if (getErrorBodyMessage(error) === "This URL is Already Registered!") {
        throw new SDKError("Webhook URL is already registered.", error);
      }
      throw new SDKError("Failed to create webhook", error);
    }
  },

  async list(): Promise<Webhook.ListResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.get<Webhook.ListResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get webhook list", error);
    }
  },

  async get(id: string): Promise<Webhook.GetResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.get<Webhook.GetResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get webhook list", error);
    }
  },

  async update(
    id: string,
    webhook: Webhook.UpdateRequest,
  ): Promise<Webhook.Response> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.put<Webhook.Response>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        webhook,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed updating webhook ", error);
    }
  },

  async toggle(id: string): Promise<Webhook.Response> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.patch<Webhook.Response>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}/toggle`,
        undefined,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed updating webhook ", error);
    }
  },

  async delete(id: string): Promise<Webhook.DeleteResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.delete<Webhook.DeleteResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed deleting webhook ", error);
    }
  },

  async listNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Webhook.ListNotificationsResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(params);
      const response = await httpClient.get<Webhook.ListNotificationsResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/notifications${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed getting webhook notificaiton list ", error);
    }
  },

  async getNotification(id: string): Promise<Webhook.GetNotificationResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.get<Webhook.GetNotificationResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed getting webhook notificaiton ", error);
    }
  },
});
