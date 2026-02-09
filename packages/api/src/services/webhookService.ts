import type {
  DeleteWebhookResponse,
  GetAllWebhookNotificationResponse,
  GetAllWebhooksResponse,
  GetWebhookNotificationResponse,
  GetWebhookResponse,
  OakClient,
  Result,
  RegisterWebhookRequest,
  RegisterWebhookResponse,
  ToggleWebhookResponse,
  UpdateWebhookRequest,
  UpdateWebhookResponse,
} from "../types";
import { httpClient } from "../utils/httpClient";
import { buildQueryString } from "./helpers";
import { err } from "../types";

export interface WebhookService {
  register(
    webhook: RegisterWebhookRequest,
  ): Promise<Result<RegisterWebhookResponse>>;
  list(): Promise<Result<GetAllWebhooksResponse>>;
  get(id: string): Promise<Result<GetWebhookResponse>>;
  update(
    id: string,
    webhook: UpdateWebhookRequest,
  ): Promise<Result<UpdateWebhookResponse>>;
  toggle(id: string): Promise<Result<ToggleWebhookResponse>>;
  delete(id: string): Promise<Result<DeleteWebhookResponse>>;
  listNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<GetAllWebhookNotificationResponse>>;
  getNotification(id: string): Promise<Result<GetWebhookNotificationResponse>>;
}

export const createWebhookService = (client: OakClient): WebhookService => ({
  async register(
    webhook: RegisterWebhookRequest,
  ): Promise<Result<RegisterWebhookResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.post<RegisterWebhookResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks`,
      webhook,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async list(): Promise<Result<GetAllWebhooksResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.get<GetAllWebhooksResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        retryOptions: client.retryOptions,
      },
    );
  },

  async get(id: string): Promise<Result<GetWebhookResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.get<GetWebhookResponse>(
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
    webhook: UpdateWebhookRequest,
  ): Promise<Result<UpdateWebhookResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.put<UpdateWebhookResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
      webhook,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async toggle(id: string): Promise<Result<ToggleWebhookResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.patch<ToggleWebhookResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}/toggle`,
      undefined,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async delete(id: string): Promise<Result<DeleteWebhookResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }

    return httpClient.delete<DeleteWebhookResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async listNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<GetAllWebhookNotificationResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    const queryString = buildQueryString(params);
    return httpClient.get<GetAllWebhookNotificationResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/notifications${queryString}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },

  async getNotification(
    id: string,
  ): Promise<Result<GetWebhookNotificationResponse>> {
    const token = await client.getAccessToken();
    if (!token.ok) {
      return err(token.error);
    }
    return httpClient.get<GetWebhookNotificationResponse>(
      `${client.config.baseUrl}/api/v1/merchant/webhooks/notifications/${id}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
        retryOptions: client.retryOptions,
      },
    );
  },
});
