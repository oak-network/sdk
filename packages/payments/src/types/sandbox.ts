import { ApiResponse } from "./common";

export namespace Sandbox {
  export interface WebhookSimulationRequest {
    category: string;
    provider?: string;
    provider_data?: {
      status?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  export type WebhookSimulationResponse = ApiResponse<unknown>;
}
