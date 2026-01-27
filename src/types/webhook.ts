// ----------------------
// Core Webhook Types

import { ApiResponse } from "./common";

// ----------------------
export interface WebhookData {
  id: string;
  url: string;
  description?: string;
  secret: string;
  is_active: boolean;
}

export type PublicWebhookData = Omit<WebhookData, "secret">;

// ----------------------
// Requests
// ----------------------
export interface RegisterWebhookRequest {
  url: string;
  description?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  description?: string;
}

// ----------------------
// Notifications
// ----------------------
export interface WebhookNotification {
  id: string;
  is_acknowledged: boolean;
  event: string | null;
  category: string | null;
  data: any;
}

// ----------------------
// Responses
// ----------------------
export type RegisterWebhookResponse = ApiResponse<WebhookData>;
export type GetAllWebhooksResponse = ApiResponse<PublicWebhookData[]>;
export type GetWebhookNotificationResponse = ApiResponse<WebhookNotification>;
export type ToggleWebhookResponse = ApiResponse<WebhookData>;
export type GetAllWebhookNotificationResponse = ApiResponse<{
  count: number;
  transaction_list: WebhookNotification[];
}>;
export type GetWebhookResponse = ApiResponse<PublicWebhookData>;
export type UpdateWebhookResponse = ApiResponse<WebhookData>;
export type DeleteWebhookResponse = ApiResponse<{ success: boolean }>;
