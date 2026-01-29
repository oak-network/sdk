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
  Result,
  ok,
  err,
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
  ): Promise<Result<RegisterWebhookResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.post<RegisterWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks`,
        webhook,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error: any) {
      if (error.body?.msg === "This URL is Already Registered!") {
        return err(new SDKError("Webhook URL is already registered.", error));
      }
      return err(new SDKError("Failed to create webhook", error));
    }
  }

  async getAllWebhooks(): Promise<Result<GetAllWebhooksResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<GetAllWebhooksResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get webhook list", error));
    }
  }

  async getWebhook(id: string): Promise<Result<GetWebhookResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<GetWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed to get webhook list", error));
    }
  }

  async updateWebhook(
    id: string,
    webhook: UpdateWebhookRequest
  ): Promise<Result<UpdateWebhookResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.put<UpdateWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        webhook,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed updating webhook ", error));
    }
  }

  async toggleWebhook(
    id: string
  ): Promise<Result<ToggleWebhookResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.patch<ToggleWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/${id}/toggle`,
        undefined, // no body needed
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed updating webhook ", error));
    }
  }

  async deleteWebhook(
    id: string
  ): Promise<Result<DeleteWebhookResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

      const response = await httpClient.delete<DeleteWebhookResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed deleting webhook ", error));
    }
  }

  async getAllWebhookNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<GetAllWebhookNotificationResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }

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
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed getting webhook notificaiton list ", error));
    }
  }

  async getWebhookNotifications(
    id: string
  ): Promise<Result<GetWebhookNotificationResponse, SDKError>> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token.ok) {
        return err(token.error);
      }
      const response = await httpClient.get<GetWebhookNotificationResponse>(
        `${this.config.baseUrl}/api/v1/merchant/webhooks/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
          retryOptions: this.retryOptions,
        }
      );
      return ok(response);
    } catch (error) {
      return err(new SDKError("Failed getting webhook notificaiton ", error));
    }
  }
}
