import type { Sandbox, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface SandboxService {
  simulateWebhook(
    provider: string,
    request: Sandbox.WebhookSimulationRequest,
  ): Promise<Result<Sandbox.WebhookSimulationResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns SandboxService instance
 */
export const createSandboxService = (client: OakClient): SandboxService => ({
  async simulateWebhook(
    provider: string,
    request: Sandbox.WebhookSimulationRequest,
  ): Promise<Result<Sandbox.WebhookSimulationResponse>> {
    return withAuth(client, (token) =>
      httpClient.post<Sandbox.WebhookSimulationResponse>(
        buildUrl(
          client.config.baseUrl,
          "api/v1/sandbox/webhooks",
          provider,
          "simulate",
        ),
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
