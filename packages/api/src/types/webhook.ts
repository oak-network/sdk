import { ApiResponse } from "./common";

export namespace Webhook {
  // ----------------------
  // Data
  // ----------------------
  export interface Data {
    id: string;
    url: string;
    description?: string;
    secret: string;
    is_active: boolean;
  }

  export type PublicData = Omit<Data, "secret">;

  // ----------------------
  // Requests
  // ----------------------
  export interface RegisterRequest {
    url: string;
    description?: string;
  }

  export interface UpdateRequest {
    url?: string;
    description?: string;
  }

  // ----------------------
  // Notifications
  // ----------------------
  export interface Notification {
    id: string;
    is_acknowledged: boolean;
    event: string | null;
    category: string | null;
    data: any;
  }

  export interface ListNotificationsQuery {
    limit?: number;
    offset?: number;
  }

  export interface ListNotificationsData {
    count: number;
    notification_list: Notification[];
  }

  // ----------------------
  // Responses
  // ----------------------
  export type Response = ApiResponse<Data>;

  export type GetResponse = ApiResponse<PublicData>;
  export type ListResponse = ApiResponse<PublicData[]>;
  export type DeleteResponse = ApiResponse<{ success: boolean }>;

  export type GetNotificationResponse = ApiResponse<Notification>;
  export type ListNotificationsResponse = ApiResponse<ListNotificationsData>;
}
