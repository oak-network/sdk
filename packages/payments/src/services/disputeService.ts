import type { Dispute, OakClient, Result } from "../types";
import { httpClient } from "../utils/httpClient";
import { withAuth } from "../utils/withAuth";
import { buildUrl } from "../utils/buildUrl";

export interface DisputeService {
  list(): Promise<Result<Dispute.ListResponse>>;
  updateEvidence(
    disputeId: string,
    evidence: Dispute.EvidenceRequest,
  ): Promise<Result<Dispute.UpdateResponse>>;
  submit(disputeId: string): Promise<Result<Dispute.SubmitResponse>>;
  close(disputeId: string): Promise<Result<Dispute.CloseResponse>>;
}

/**
 * @param client - Configured OakClient instance
 * @returns DisputeService instance
 */
export const createDisputeService = (client: OakClient): DisputeService => ({
  async list(): Promise<Result<Dispute.ListResponse>> {
    return withAuth(client, (token) =>
      httpClient.get<Dispute.ListResponse>(
        buildUrl(client.config.baseUrl, "api/v1/disputes"),
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async updateEvidence(
    disputeId: string,
    evidence: Dispute.EvidenceRequest,
  ): Promise<Result<Dispute.UpdateResponse>> {
    return withAuth(client, (token) =>
      httpClient.put<Dispute.UpdateResponse>(
        buildUrl(client.config.baseUrl, "api/v1/disputes", disputeId, "evidence"),
        evidence,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async submit(disputeId: string): Promise<Result<Dispute.SubmitResponse>> {
    return withAuth(client, (token) =>
      httpClient.put<Dispute.SubmitResponse>(
        buildUrl(client.config.baseUrl, "api/v1/disputes", disputeId, "submit"),
        undefined,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },

  async close(disputeId: string): Promise<Result<Dispute.CloseResponse>> {
    return withAuth(client, (token) =>
      httpClient.put<Dispute.CloseResponse>(
        buildUrl(client.config.baseUrl, "api/v1/disputes", disputeId, "close"),
        undefined,
        {
          headers: { Authorization: `Bearer ${token}` },
          retryOptions: client.retryOptions,
        },
      ),
    );
  },
});
