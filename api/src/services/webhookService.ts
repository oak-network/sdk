import {
  RegisterWebhookResponse,
  RegisterWebhookRequest,
  SDKConfig,
  GetAllWebhooksResponse,
  GetWebhookResponse,
  UpdateWebhookRequest,
  DeleteWebhookResponse,
  GetAllWebhookNotificationResponse,
  GetWebhookNotificationResponse,
  UpdateWebhookResponse,
  ToggleWebhookResponse,
} from "../types";
import { httpClient, SDKError } from "../utils";
import { RetryOptions } from "../utils/defaultRetryConfig";
import { AuthService } from "./authService";

export class WebhookService {
  private config: SDKConfig;
  private authService: AuthService;
  private retryOptions: RetryOptions;

  constructor(
    config: SDKConfig,
    authService: AuthService,
    retryOptions: RetryOptions
  ) {
    this.config = config;
    this.authService = authService;
    this.retryOptions = retryOptions;
  }

  async registerWebhook(
    webhook: RegisterWebhookRequest
  ): Promise<RegisterWebhookResponse> {
    try {
      const token = await this.authService.getAccessToken();
      const response = await httpClient.post<RegisterWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks`,
        webhook,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error: any) {
      if (error.body?.msg === "This URL is Already Registered!") {
        throw new SDKError("Webhook URL is already registered.", error);
      }
      throw new SDKError("Failed to create webhook", error);
    }
  }

  async getAllWebhooks(): Promise<GetAllWebhooksResponse> {
    try {
      const token = await this.authService.getAccessToken();
      const response = await httpClient.get<GetAllWebhooksResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get webhook list", error);
    }
  }

  async getWebhook(id: string): Promise<GetWebhookResponse> {
    try {
      const token = await this.authService.getAccessToken();
      const response = await httpClient.get<GetWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed to get webhook list", error);
    }
  }

  async updateWebhook(
    id: string,
    webhook: UpdateWebhookRequest
  ): Promise<UpdateWebhookResponse> {
    try {
      const token = await this.authService.getAccessToken();
      const response = await httpClient.put<UpdateWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        webhook,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed updating webhook ", error);
    }
  }

  async toggleWebhook(id: string): Promise<ToggleWebhookResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.patch<ToggleWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/${id}/toggle`,
        undefined, // no body needed
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed updating webhook ", error);
    }
  }

  async deleteWebhook(id: string): Promise<DeleteWebhookResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const response = await httpClient.delete<DeleteWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed deleting webhook ", error);
    }
  }

  async getAllWebhookNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<GetAllWebhookNotificationResponse> {
    try {
      const token = await this.authService.getAccessToken();

      const queryString = params
        ? `?${Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .map(
              ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join("&")}`
        : "";
      const response = await httpClient.get<GetAllWebhookNotificationResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/notifications?${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed getting webhook notificaiton list ", error);
    }
  }

  async getWebhookNotifications(
    id: string
  ): Promise<GetWebhookNotificationResponse> {
    try {
      const token = await this.authService.getAccessToken();
      const response = await httpClient.get<GetWebhookNotificationResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: this.retryOptions,
        }
      );
      return response;
    } catch (error) {
      throw new SDKError("Failed getting webhook notificaiton ", error);
    }
  }
}
