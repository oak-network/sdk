import type {
  DeleteWebhookResponse,
  GetAllWebhookNotificationResponse,
  GetAllWebhooksResponse,
  GetWebhookNotificationResponse,
  GetWebhookResponse,
  OakClient,
  RegisterWebhookRequest,
  RegisterWebhookResponse,
  ToggleWebhookResponse,
  UpdateWebhookRequest,
  UpdateWebhookResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { SDKError } from "../utils/errorHandler";
import { buildQueryString, getErrorBodyMessage } from "./helpers";

export interface WebhookService {
  register(webhook: RegisterWebhookRequest): Promise<RegisterWebhookResponse>;
  list(): Promise<GetAllWebhooksResponse>;
  get(id: string): Promise<GetWebhookResponse>;
  update(
    id: string,
    webhook: UpdateWebhookRequest,
  ): Promise<UpdateWebhookResponse>;
  toggle(id: string): Promise<ToggleWebhookResponse>;
  delete(id: string): Promise<DeleteWebhookResponse>;
  listNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<GetAllWebhookNotificationResponse>;
  getNotification(id: string): Promise<GetWebhookNotificationResponse>;
}

export const createWebhookService = (client: OakClient): WebhookService => ({
  async register(
    webhook: RegisterWebhookRequest,
  ): Promise<RegisterWebhookResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.post<RegisterWebhookResponse>(
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

  async list(): Promise<GetAllWebhooksResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.get<GetAllWebhooksResponse>(
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

  async get(id: string): Promise<GetWebhookResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.get<GetWebhookResponse>(
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
    webhook: UpdateWebhookRequest,
  ): Promise<UpdateWebhookResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.put<UpdateWebhookResponse>(
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

  async toggle(id: string): Promise<ToggleWebhookResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.patch<ToggleWebhookResponse>(
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

  async delete(id: string): Promise<DeleteWebhookResponse> {
    try {
      const token = await client.getAccessToken();

      const response = await httpClient.delete<DeleteWebhookResponse>(
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
  }): Promise<GetAllWebhookNotificationResponse> {
    try {
      const token = await client.getAccessToken();
      const queryString = buildQueryString(params);
      const response = await httpClient.get<GetAllWebhookNotificationResponse>(
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

  async getNotification(id: string): Promise<GetWebhookNotificationResponse> {
    try {
      const token = await client.getAccessToken();
      const response = await httpClient.get<GetWebhookNotificationResponse>(
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
