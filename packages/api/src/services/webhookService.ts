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
import { SDKError } from "../utils/errorHandler";
import { buildQueryString, getErrorBodyMessage } from "./helpers";
import { err, ok } from "../types";

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
  ): Promise<Result<RegisterWebhookResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.post<RegisterWebhookResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks`,
        webhook,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      if (getErrorBodyMessage(error) === "This URL is Already Registered!") {
        return err(new SDKError("Webhook URL is already registered.", error));
      }
      return err(new SDKError("Failed to create webhook", error));
    }
  },

  async list(): Promise<Result<GetAllWebhooksResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<GetAllWebhooksResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get webhook list", error));
    }
  },

  async get(id: string): Promise<Result<GetWebhookResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<GetWebhookResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get webhook list", error));
    }
  },

  async update(
    id: string,
    webhook: UpdateWebhookRequest,
  ): Promise<Result<UpdateWebhookResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.put<UpdateWebhookResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        webhook,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed updating webhook ", error));
    }
  },

  async toggle(id: string): Promise<Result<ToggleWebhookResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.patch<ToggleWebhookResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}/toggle`,
        undefined,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed updating webhook ", error));
    }
  },

  async delete(id: string): Promise<Result<DeleteWebhookResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.delete<DeleteWebhookResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed deleting webhook ", error));
    }
  },

  async listNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<GetAllWebhookNotificationResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const queryString = buildQueryString(params);
      const response = await httpClient.get<GetAllWebhookNotificationResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/notifications${queryString}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed getting webhook notificaiton list ", error));
    }
  },

  async getNotification(
    id: string,
  ): Promise<Result<GetWebhookNotificationResponse, SDKError>> {
    try {
      const token = await client.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<GetWebhookNotificationResponse>(
        `${client.config.baseUrl}/api/v1/merchant/webhooks/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: client.retryOptions,
        },
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed getting webhook notificaiton ", error));
    }
  },
});
